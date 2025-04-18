//載入node.js模組「http」
const http = require("http");

//載入npm模組「uuid」
const { v4: uuidv4 } = require('uuid');

//載入自訂模組「errorResponse」
const errorResponse = require("./errorResponse");

//宣告變數「todos」，用於儲存所有todo資訊
const todos = [];

//宣告函式「.createServer()」中的函式「requestListener」
const requestListener = (request,response) => {
	//宣告函式「.writeHead()」的參數「headers」
	const headers = {
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
	   	'Content-Type': 'application/json'
	 }
	 //接收API請求的body內容。將各封包(chunk)資訊組合為完整資訊(body)
	 let body = "";
	 request.on("data", chunk =>{
		body += chunk;
	 })
	//依據請求的「url」與「method」，執行相應動作
	//查詢所有todo資訊
	if(request.url == "/todos" && request.method == "GET"){
		response.writeHead(200,headers);
		response.write(JSON.stringify({
			"status" : "successful", 
			"data" : todos
		}));
		response.end();
	//新增1筆todo資訊
	}else if(request.url == "/todos" && request.method == "POST"){
		//完成接受API請求的body內容後觸發，包含「try-catch」機制
		request.on("end", () =>{
			try{
				const addTitle = JSON.parse(body).title; //利用「JSON.parse()」將字串型別變數「body」轉換成物件，並讀取其屬性「title」
				if(addTitle !== undefined){
					const addTodo = {
						"title" : addTitle, 
						"id" : uuidv4()
					};
					todos.push(addTodo);
					response.writeHead(200,headers);
					response.write(JSON.stringify({
						"status" : "success", 
						"data" : todos
					}));
					response.end();
				}else{
					errorResponse(response); //要帶入參數「response」
				}
			}catch{
				errorResponse(response); //要帶入參數「response」
			}
			
		})	
	//刪除所有todo資訊
	}else if(request.url == "/todos" && request.method == "DELETE"){
		todos.length = 0; //刪除陣列「todos」所有資訊
		response.writeHead(200,headers);
		response.write(JSON.stringify({
			"status" : "success", 
			"data" : todos
		}));
		response.end();
	//刪除單筆todo資訊
	}else if(request.url.startsWith("/todos/") && request.method == "DELETE"){
		const deleteId = request.url.split("/").pop();
		const deleteIndex = todos.findIndex(item => item.id == deleteId);
		if(deleteIndex !== -1){
			todos.splice(deleteIndex, 1);
			response.writeHead(200,headers);
			response.write(JSON.stringify({
				"status" : "success", 
				"data" : todos
			}));
			response.end();
		}else{
			errorResponse(response); //要帶入參數「response」
		}
	//編輯單筆todo資訊
	}else if(request.url.startsWith("/todos/") && request.method == "PATCH"){
		//完成接受API請求的body內容後觸發，包含「try-catch」機制
		request.on("end", () =>{
			try{
				const editTitle = JSON.parse(body).title; //利用「JSON.parse()」將字串型別變數「body」轉換成物件，並讀取其屬性「title」
				const editId = request.url.split("/").pop();
				const editIndex = todos.findIndex(item => item.id == editId);
				if(editTitle !== undefined && editIndex !== -1){
					todos[editIndex].title = editTitle;
					response.writeHead(200,headers);
					response.write(JSON.stringify({
						"status" : "success", 
						"data" : todos
					}));
					response.end();
				}else{
					errorResponse(response); //要帶入參數「response」
				}
			}catch{
				errorResponse(response); //要帶入參數「response」
			}
			
		})
	//判斷是否為「預檢請求(preflight)」
	}else if(request.method == "OPTIONS"){
        response.writeHead(200,headers);
        response.end();
	}else{
		response.writeHead(404,headers);
		response.write(JSON.stringify({
			"status" : "false", 
			"alarmText" : "錯誤網址！"
		}));
		response.end();
	}
}

//帶入函式「requestListener」並執行；利用函式「.listen()」監聽請求
http.createServer(requestListener).listen(process.env.PORT || 3005); //本地端用「3005」；部屬在雲端平台增加指令「process.env.PORT」