'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

const getDefName = (_a) => { var _b; var { kind } = _a, def = __rest(_a, ["kind"]); return ('name' in def ? (_b = def.name) === null || _b === void 0 ? void 0 : _b.value : kind); };
const containsDef = (acc, def) => acc.some((accDef) => accDef.kind === def.kind && getDefName(accDef) === getDefName(def));
const mergeImportDefs = (doc, imports) => (Object.assign(Object.assign({}, doc), { definitions: Object.values(imports)
        .concat([doc])
        .reduce((acc, { definitions }) => [...acc, ...definitions], [])
        .reduce((acc, def) => (containsDef(acc, def) ? acc : [...acc, def]), []) }));

exports.mergeImportDefs = mergeImportDefs;
