// SQLite JSONB literal, predicate, negation and request-budget integration.
const patches = [
  [
    "return tm(t,{...r,dialect:e,db:s.db??r.db,introspection:s.introspection,schema:s.schema,requestSchema:s.requestSchema})}",
    "return __jsonbCheck(tm(t,{...r,dialect:e,db:s.db??r.db,introspection:s.introspection,schema:s.schema,requestSchema:s.requestSchema}),e)}"
  ],
  [
    "return n?{$not:{[a]:u}}:{[a]:u}",
    "return n?{$not:__jsonbMark({[a]:u},a,i)}:__jsonbMark({[a]:u},a,i)"
  ],
  [
    "for(let[l,c]of Object.entries(o)){if(xt(c))",
    "for(let[l,c]of Object.entries(o)){let __j=__jsonbTry(s,l,c,n,o,{parsePath:_n,reference:fe});if(__j){r.push(__j);continue}if(xt(c))"
  ],
  [
    "for(let[f,d]of Object.entries(u))if(a)",
    "for(let[f,d]of Object.entries(u))if(__jsonbTry(s,f,d,n,u,{parsePath:_n,reference:fe})){r.push(t.not(__jsonbTry(s,f,d,n,u,{parsePath:_n,reference:fe})))}else if(a)"
  ]
];

export function patchJsonbContainment(input, adapterUrl) {
  let output = input;
  for (const [from, to] of patches) {
    if (output.split(from).length !== 2)
      throw new Error(`Expected exactly one JSONB integration seam: ${from}`);
    output = output.replace(from, () => to);
  }
  return `// Modified: SQLite JSONB containment.\nimport {markJsonbLiteral as __jsonbMark,tryJsonbContainment as __jsonbTryImpl,assertJsonbQueryLimits as __jsonbQueryLimits} from ${JSON.stringify(adapterUrl)};\nfunction __jsonbError(error){if(error?.code==="54000")throw new Ie({httpStatus:400,code:error.code,message:error.message,details:null,hint:"Reduce the JSONB filter size or depth."});throw error}\nfunction __jsonbTry(...args){try{return __jsonbTryImpl(...args)}catch(error){__jsonbError(error)}}\nfunction __jsonbCheck(query,dialect){if(dialect==="sqlite"){try{__jsonbQueryLimits(query.compile())}catch(error){__jsonbError(error)}}return query}\n${output}`;
}
