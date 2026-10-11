/** Refuse known runtime/build secrets before sending an HTTP request. */
const sensitive=/(PASS|SECRET|TOKEN|CREDENTIAL|PRIVATE_KEY|PRIVKEY|API_?KEY|ACCESS_KEY|_KEY$|SALT|DSN|MNEMONIC|KEYSTORE|SIGNING_|COOKIES?$|COOKIE_(STRING|VALUE|HEADER|JAR)$|(^|_)(PW|PWD|PAT|AUTH|SK|SEED|OTP|TOTP)($|_))/;
export function secretInputRefusal(args:Record<string,unknown>,knownNames:string[]=[],depth=0):{message:string;steps:Array<Record<string,unknown>>}|null {
  if(depth<8)for(const [field,nested]of Object.entries(args)){
    let object=nested;if(typeof object==='string'&&['document','manifest'].includes(field)){try{object=JSON.parse(object);}catch{object=null;}}
    if(object&&typeof object==='object'&&!['vars','set','replace','secrets','build_secrets','public_build_vars'].includes(field)){const refusal=secretInputRefusal(object as Record<string,unknown>,[],depth+1);if(refusal)return refusal;}
  }
  let found=(typeof args.git_token==='string'&&args.git_token!=='')||typeof args.password==='string'&&args.password!==''||(!!args.onion_import&&typeof args.onion_import==='object'&&Object.keys(args.onion_import).length>0);
  if(Array.isArray(args.vars))for(const spec of args.vars){
    if(!spec||typeof spec!=='object'||typeof spec.name!=='string')continue;
    for(const field of ['default','value'])if(typeof spec[field]==='string'&&spec[field]!==''&&spec[field]!=='__IMPREZA_KEEP__'&&spec[field]!=='********'&&(spec.secret===true||spec.validation==='secret'||!!spec.generate||sensitive.test(spec.name.toUpperCase())))found=true;
  }
  for(const field of ['secrets','build_secrets','vars','set','replace','public_build_vars']){
    const values=args[field];if(!values||typeof values!=='object'||Array.isArray(values))continue;
    for(const [key,value]of Object.entries(values)){
      if(value==='__IMPREZA_KEEP__'||value==='********')continue;
      if(field==='secrets'||field==='build_secrets'||knownNames.includes(key.toUpperCase())||(typeof value==='string'&&(sensitive.test(key.toUpperCase())||/:\/\/[^/\s@]*:[^/\s@]+@/.test(value))))found=true;
    }
  }
  if(!found)return null;
  if('git_token' in args||'password' in args||'onion_import' in args||args.build_secrets||args.public_build_vars)return {message:'Secret values must be entered by the account owner in the portal. If already sent in chat, rotate them: refusing a tool cannot erase the provider transcript.',steps:[{action:'Open the matching Git access, password, onion import or build credential form in My Apps. Runtime variable entry links cannot set these credentials.',requires:'account owner login',doc:'https://docs.imprezahost.com/customer-workflows.html#secret-entry'}]};

  return {message:'Secret values must be entered by the account owner in the portal. Do not resend the value in chat. If already sent, rotate it: refusing a tool cannot erase the provider transcript.',steps:[{action:'Prepare an owner-authenticated entry link for an existing app or variable group. For a first deployment, enter its secrets directly in My Apps.',tool:'impreza_prepare_secret_entry',missing:['variable_name'],requires:'account owner login',doc:'https://docs.imprezahost.com/customer-workflows.html#secret-entry'}]};
}