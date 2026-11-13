function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type,Content-Range,Range');}
function json(res,status,obj){cors(res);res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(obj));}
function body(req){return new Promise((resolve,reject)=>{const chunks=[];let n=0;req.on('data',c=>{n+=c.length;if(n>5*1024*1024){reject(new Error('حجم JSON أكبر من المسموح'));req.destroy();}else chunks.push(c)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString()||'{}'))}catch{reject(new Error('JSON غير صالح'))}});req.on('error',reject)});}
module.exports={cors,json,body};
