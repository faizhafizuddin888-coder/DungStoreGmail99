const express=require('express');const session=require('express-session');const Database=require('better-sqlite3');
const path=require('path');const app=express();const db=new Database('gmail-store.db');
const PORT=process.env.PORT||3000;const OWNER_USER=process.env.OWNER_USER||'DungStoreGmail99';const OWNER_PASS=process.env.OWNER_PASS||'ubah-password-ini';
db.exec(`CREATE TABLE IF NOT EXISTS gmail_entries(id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL)`);
app.use(express.json());app.use(express.urlencoded({extended:true}));app.use(session({secret:process.env.SESSION_SECRET||'change-this-secret',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:false}}));
app.use(express.static(path.join(__dirname,'public')));
app.post('/api/submit',(req,res)=>{const email=String(req.body.email||'').trim().toLowerCase();if(!/^[^\s@]+@gmail\.com$/.test(email))return res.status(400).json({error:'Masukkan alamat Gmail yang valid.'});try{db.prepare('INSERT INTO gmail_entries(email,created_at) VALUES(?,?)').run(email,new Date().toISOString());return res.json({ok:true});}catch(e){if(String(e.message).includes('UNIQUE'))return res.status(409).json({error:'Gmail tersebut sudah tersimpan.'});return res.status(500).json({error:'Gagal menyimpan data.'});}});
app.post('/api/login',(req,res)=>{if(req.body.username===OWNER_USER&&req.body.password===OWNER_PASS){req.session.owner=true;return res.json({ok:true});}res.status(401).json({error:'Username atau password salah.'});});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
function auth(req,res,next){if(!req.session.owner)return res.status(401).json({error:'Unauthorized'});next();}
app.get('/api/entries',auth,(req,res)=>{const rows=db.prepare('SELECT id,email,created_at FROM gmail_entries ORDER BY id DESC').all();res.json({count:rows.length,entries:rows});});
app.delete('/api/entries/:id',auth,(req,res)=>{db.prepare('DELETE FROM gmail_entries WHERE id=?').run(req.params.id);res.json({ok:true});});
app.get('/owner',(req,res)=>res.sendFile(path.join(__dirname,'public','owner.html')));
app.listen(PORT,()=>console.log(`DungStoreGmail99 running on http://localhost:${PORT}`));
