var fs = require('fs');
var path = require('path');
var BaseService = require('./baseService');
var pg = require('pg');
var pgcopy = require('pg-copy-streams');
var fsext = require(path.join(__base, '/server/lib/fsext'))();

var loadSQL = (sqlpath) => {
    let filelist = fsext.getSubfiles(sqlpath);
    let sqlfiles = new Map();
    let rtn = {};
    for(let filepath of filelist) {
        let file = fs.readFileSync(filepath);    
        sqlfiles.set(path.basename(filepath).toLowerCase().replace('.sql',''), file.toString());
    }
    rtn['queries'] = sqlfiles;
    let folderlist = fsext.getSubfolders(sqlpath);
    for(let fldr of folderlist) {
        rtn[path.basename(fldr)] = loadSQL(fldr);
    }

    return rtn;
};

const sqlLibPath = path.join(__base, '/server/sql');

var PgdbService = class extends BaseService {
    constructor(config) {
        super();

        this._config = {
            user: config.credentials.username, //env var: PGUSER
            database: config.credentials.database, //env var: PGDATABASE
            password: config.credentials.password, //env var: PGPASSWORD
            host: config.credentials.hostname, // Server hosting the credentials database
            port: config.credentials.port, //env var: PGPORT
            max: 10, // max number of clients in the pool
            idleTimeoutMillis: 2000, // how long a client is allowed to remain idle before being closed          
        };

        this._cache = null;
        this._cacheLocation = path.join(__base, '/server/repo/pgdbService_cache.json');
        this._cacheEnabled = false;

        this._sqlmap = loadSQL(sqlLibPath);

    }

    get config() {
        return this._config;
    }

    async _processStandardSPCall(schema, spCall, orderedInputs = []) {
        var _self = this;

        let _arrayToPgValues = (arr, includeNull = true) => {
            let rtn = "";
            for (let val of arr) {
                switch (typeof val) {
                    case 'string':
                        if (rtn.length > 0) rtn += ',';
                        rtn += `'${val}'`;
                        break;
                    case 'number':
                        if (rtn.length > 0) rtn += ',';
                        rtn += `${val}`;
                        break;
                    default:
                        // noop
                        if (val === null && includeNull) {
                            if (rtn.length > 0) rtn += ',';
                            rtn += 'null';
                        }
                }
            }
            return rtn;
        };
        let _validateReturn = (rtnTable) => {
            let output = { outputStatus: 0, outputMessage: '' };
            if (rtnTable.fields.length === 1 && rtnTable.fields[0].name.toLowerCase() === spCall.toLowerCase() && rtnTable.rows.length === 1) {
                switch (rtnTable.rows[0][spCall]) {
                    case -2:
                        output = { outputStatus: 1, outputMessage: 'Asset not found!' };
                        break;
                    case -1:
                        output = { outputStatus: 1, outputMessage: 'Attribute not found!' };
                        break;
                    default:
                }
            }
            return output;
        };

        return await new Promise(async (resolve, reject) => {
            let pool = new pg.Pool(this._config);
            var client = await pool.connect();
            try {
                // if (_self._cacheEnabled) {
                //     let val = await _self.readCache(spCall, scrubbedInputs, outputs);
                //     if (val) {
                //         resolve(val);
                //     }
                // }

                let vals = _arrayToPgValues(orderedInputs);
                var qry = `set search_path = "${schema}"; SELECT * FROM ${spCall}(${vals});`;
                var results = await client.query(qry);

                if (!(results && results.length == 2 &&
                    results[1].hasOwnProperty("rows"))) {
                    throw new Error('Unexpected or malformed SP results object!');
                }

                let val = _validateReturn(results[1]);
                if (val.outputStatus !== 0) {
                    throw new Error(val.outputMessage);
                }

                // if (_self._cacheEnabled) {
                //     await _self.writeCache(spCall, scrubbedInputs, outputs, result.recordset);
                // }

                resolve(results[1].rows);

            } catch (err) {
                reject(err);
            } finally {
                client.release();
            }
        });
    }

    async _processStandardSPCallLoop(schema, spCall, orderedInputs = [[]]) {
        var _self = this;

        let _arrayToPgValues = (arr) => {
            let rtn = "";
            for (let val of arr) {
                switch (typeof val) {
                    case 'string':
                        if (rtn.length > 0) rtn += ',';
                        rtn += `'${val.replace(/'/g,"''")}'`;
                        break;
                    case 'number':
                        if (rtn.length > 0) rtn += ',';
                        rtn += `${val}`;
                        break;
                    case 'object': // <-- assumes anything listed as object will be a null
                        if (rtn.length > 0) rtn += ',';
                        rtn += 'NULL';
                        break;
                    default:
                    // noop
                }
            }
            return rtn;
        };
        let _validateReturn = (rtnTable) => {
            let output = { outputStatus: 0, outputMessage: '' };
            if (rtnTable.fields.length === 1 && rtnTable.fields[0].name.toLowerCase() === spCall.toLowerCase() && rtnTable.rows.length === 1) {
                switch (rtnTable.rows[0][spCall]) {
                    case -2:
                        output = { outputStatus: 1, outputMessage: 'Asset not found!' };
                        break;
                    case -1:
                        output = { outputStatus: 1, outputMessage: 'Attribute not found!' };
                        break;
                    default:
                }
            }
            return output;
        };

        return await new Promise(async (resolve, reject) => {
            let pool = new pg.Pool(this._config);
            var client = await pool.connect();
            try {

                let qrylist = [];

                for (let ip of orderedInputs) {
                    qrylist.push(
                        await new Promise(async (resolve, reject) => {
                            try {
                                let vals = _arrayToPgValues(ip);
                                var qry = `set search_path = "${schema}"; SELECT * FROM ${spCall}(${vals});`;
                                console.log(qry)
                                var results = await client.query(qry);

                                if (!(results && results.length == 2 &&
                                    results[1].hasOwnProperty("rows"))) {
                                    throw new Error('Unexpected or malformed SP results object!');
                                }

                                let val = _validateReturn(results[1]);
                                if (val.outputStatus !== 0) {
                                    throw new Error(val.outputMessage);
                                }

                                resolve(results[1].rows);

                            } catch (e) {
                                reject(e);
                            }
                        })
                    );
                }

                let rtn = await Promise.all(qrylist);
                resolve(rtn);
            } catch (err) {
                reject(err);
            } finally {
                client.release();
            }
        });
    }

    async initCache() {
        var _self = this;
        return await new Promise(async (resolve, reject) => {
            try {
                if (_self._cache) {
                    resolve(true);
                }
                if (!fs.existsSync(_self._cacheLocation)) {
                    _self._cache = new Map([]);
                    fs.writeFileSync(_self._cacheLocation, JSON.stringify([..._self._cache]));
                }
                var _inputCacheRawJson = fs.readFileSync(_self._cacheLocation);
                _self._cache = new Map(JSON.parse(_inputCacheRawJson));
                resolve(true);
            } catch (e) {
                reject(e);
            }
        });
    }

    async readCache(spCall, inputs, outputs) {
        var _self = this;
        return await new Promise(async (resolve, reject) => {
            try {
                await _self.initCache();
                let key = `${spCall}|${JSON.stringify(inputs)}|${JSON.stringify(outputs)}`;
                if (!_self._cache.has(key)) {
                    resolve(null);
                }
                let rtn = _self._cache.get(key);
                resolve(rtn);
            } catch (e) {
                reject(e);
            }
        });
    }

    async writeCache(spCall, inputs, outputs, results) {
        var _self = this;
        return await new Promise(async (resolve, reject) => {
            try {
                await _self.initCache();
                let key = `${spCall}|${JSON.stringify(inputs)}|${JSON.stringify(outputs)}`;
                _self._cache.set(key, results);
                fs.writeFileSync(_self._cacheLocation, JSON.stringify([..._self._cache]));
                resolve(true);
            } catch (e) {
                reject(e);
            }
        });
    }



    // This is just a simple get-table routine, demonstrating the basic select statement
    //  --> more specific use cases will require completely customized queries (the majority of cases)
    async getTableData(table, indexBy = null, initialIndex = null, maxRecords = 1000, orderBy = null, orderDirection = "ASC", indexFilterSpec = '>=') {
        return await new Promise(async (resolve, reject) => {
            let pool = new pg.Pool(this._config);
            pool.on('error', (err, client) => {
                reject(err);
            });
            pool.connect((err, client, done) => {
                if (err) reject(err);
                try {

                    let qry = `SELECT * FROM ${table}`;
                    if (indexBy !== null && initialIndex !== null) {
                        let _initialIndex = null;
                        if (typeof initialIndex === 'string') {
                            _initialIndex = `'${initialIndex}'`;
                        }
                        else {
                            _initialIndex = initialIndex;
                        }
                        qry += ` WHERE ${indexBy}${indexFilterSpec}${_initialIndex}`;
                    }
                    if (orderBy !== null) {
                        qry += ` ORDER BY ${orderBy} ${orderDirection}`
                    }
                    if (typeof maxRecords === 'number') {
                        qry += ` LIMIT ${maxRecords}`
                    }

                    client.query(qry).then(results => {
                        done();
                        resolve(results);
                    }).catch(err => {
                        done();
                        reject(err);
                    });

                } catch (e) {
                    done();
                    reject(e);
                }
            });
        });
    }

    async getQryData(qryCmd) {
        return await new Promise(async (resolve, reject) => {
            let pool = new pg.Pool(this._config);
            pool.on('error', (err, client) => {
                reject(err);
            });
            pool.connect((err, client, done) => {
                if (err) reject(err);
                try {

                    let qry = `${qryCmd}`;

                    client.query(qry).then(results => {
                        done();
                        resolve(results);
                    }).catch(err => {
                        done();
                        reject(err);
                    });

                } catch (e) {
                    done();
                    reject(e);
                }
            });
        });
    }
    
    async import_from_csv(header, csvDataStream, schema, datestyle) {
        var _self = this;
        var _datestyle = (!datestyle) ? 'ISO,DMY' : datestyle;
        var _schema = (!schema) ? 'staging' : schema;
        return await new Promise(async (resolve, reject) => {
            let copyFrom = require('pg-copy-streams').from;
            let pool = new pg.Pool(this._config);
            pool.on('error', (err, client) => {
                reject(err);
            });
            pool.connect((err, client, done) => {
                if (err) reject(err);
                try {
                    // let prog = progress({ length: fileinfo.size, time: 100 /* in ms */ });
                    // prog.on('progress', status => { _self.emit('importProgress', status.percentage, status); });

                    let tmp = client.query(`set search_path = "${_schema}"; SET datestyle = '${_datestyle}';`);

                    let qry = copyFrom(`COPY ${header.name}(${header.fields.join().replace(/"/g, '')}) FROM STDIN WITH ( FORMAT csv )`);
                    let stream = client.query(qry);
                    stream.on('end', () => {
                        stream.destroy();
                        done();
                        resolve('done');
                    });
                    stream.on('error', (err) => {
                        stream.destroy();
                        done();
                        reject(err)
                    });

                    // readstream.pipe(prog).pipe(stream);
                    csvDataStream.pipe(stream);
                }
                catch (e) {
                    done();
                    reject(e);
                }
            });
        });
    }

    async import_from_csvfile(header, csvFile, schema, datestyle) {
        var _self = this;
        var _datestyle = (!datestyle) ? 'ISO,DMY' : datestyle;
        var _schema = (!schema) ? 'staging' : schema;
        return await new Promise(async (resolve, reject) => {
            let copyFrom = require('pg-copy-streams').from;
            let pool = new pg.Pool(this._config);
            pool.on('error', (err, client) => {
                reject(err);
            });
            pool.connect((err, client, done) => {
                if (err) reject(err);
                try {
                    // let prog = progress({ length: fileinfo.size, time: 100 /* in ms */ });
                    // prog.on('progress', status => { _self.emit('importProgress', status.percentage, status); });

                    let tmp = client.query(`set search_path = "${_schema}"; SET datestyle = '${_datestyle}';`);

                    let qry = copyFrom(`COPY ${header.name}(${header.fields.replace(/"/g, '')}) FROM STDIN WITH ( FORMAT csv )`);
                    let stream = client.query(qry);
                    stream.on('end', () => {
                        stream.destroy();
                        done();
                        resolve('done');
                    });
                    stream.on('error', (err) => {
                        stream.destroy();
                        done();
                        reject(err)
                    });

                    let csvDataStream = fs.createReadStream(csvFile);
                    csvDataStream.pipe(stream);
                }
                catch (e) {
                    done();
                    reject(e);
                }
            });
        });
    }

    async check_tablename_from_csv(header) {

        return await new Promise(async (resolve, reject) => {
            let pool = new pg.Pool(this._config);
            var client = await pool.connect();
            try {
                // Cross-check the name of the file being considered for import with the sp governing the mapping of file-to-table
                // await client.query(`set search_path = "ingestor"`);
                var qry_tablename = `set search_path = "ingestor"; SELECT * FROM sp_ceninggettargettable('${header.file}');`;
                var qry_sp_results = await client.query(qry_tablename);
                if (!(qry_sp_results && qry_sp_results.length == 2 && qry_sp_results[1].hasOwnProperty("rows") &&
                    qry_sp_results[1].rows.length > 0 &&
                    qry_sp_results[1].rows[0].hasOwnProperty('otargettable') &&
                    qry_sp_results[1].rows[0].otargettable)) {
                    resolve({ state: new IngestorState({ oactions: 0 }) });
                }
                var _tablename = qry_sp_results[1].rows[0].otargettable;
                var _blobstorepath = qry_sp_results[1].rows[0].oblobstorepath;
                var _datestyle = qry_sp_results[1].rows[0].odatestyle;
                var _state = new IngestorState(JSON.parse(JSON.stringify(qry_sp_results[1].rows[0])));

                resolve({ tablename: _tablename, blobstorepath: _blobstorepath, datestyle: _datestyle, state: _state });
            } catch (err) {
                reject(err);
            } finally {
                client.release();
            }

        });

    }

};

module.exports = PgdbService;