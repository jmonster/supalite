// Exact-match patch against the published @supabase/lite@0.11.0 artifact.
// Keep query execution, transforms, cardinality checks and error paths intact.
export const replacements = [
  {
    name: 'successful singular table/view HEAD response',
    before: 'let be=h?Rn(X[0]):X[0],Ge=vt(be),wt=new TextEncoder().encode(Ge),Ir=n?.cardinality==="one"?"application/vnd.pgrst.object+json":"application/json",Wa={"Content-Type":h?`${Ir};nulls=stripped; charset=utf-8`:`${Ir}; charset=utf-8`,"Content-Range":Qm(e,p,C,J),"Content-Length":String(wt.byteLength)};return d&&(Wa["Preference-Applied"]=d)',
    after: 'let be=h?Rn(X[0]):X[0],wt=e.type==="query"&&n?.head?null:new TextEncoder().encode(vt(be)),Ir=n?.cardinality==="one"?"application/vnd.pgrst.object+json":"application/json",Wa={"Content-Type":h?`${Ir};nulls=stripped; charset=utf-8`:`${Ir}; charset=utf-8`,"Content-Range":Qm(e,p,C,J)};return wt!==null&&(Wa["Content-Length"]=String(wt.byteLength)),d&&(Wa["Preference-Applied"]=d)',
  },
  {
    name: 'successful array JSON/CSV table/view HEAD response',
    before: 'let wi=m?Io(Ln):vt(an),Ha=new TextEncoder().encode(wi),Mt={"Content-Type":m?"text/csv; charset=utf-8":h?"application/vnd.pgrst.array+json;nulls=stripped; charset=utf-8":"application/json; charset=utf-8","Content-Range":me,"Content-Length":String(Ha.byteLength)};if(!p&&e.from&&g)',
    after: 'let Ha=e.type==="query"&&n?.head?null:new TextEncoder().encode(m?Io(Ln):vt(an)),Mt={"Content-Type":m?"text/csv; charset=utf-8":h?"application/vnd.pgrst.array+json;nulls=stripped; charset=utf-8":"application/json; charset=utf-8","Content-Range":me};Ha!==null&&(Mt["Content-Length"]=String(Ha.byteLength));if(!p&&e.from&&g)',
  },
];
export function patch(source) {
  for (const {name,before,after} of replacements) {
    if (source.split(before).length !== 2) throw new Error(`Expected exactly one ${name} patch anchor`);
    source=source.replace(before,after);
  }
  return source;
}
