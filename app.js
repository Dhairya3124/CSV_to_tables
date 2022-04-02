// import axios from 'axios';
// import express from 'express';
// import csvparser from 'csv-parser';
// import * as fs from 'fs';
// import path from 'path';
// import bodyParser from 'body-parser';
const axios = require('axios');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(express.static(path.resolve(__dirname,'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  axios.get('http://localhost:3000/getmagazines').then(data => {
    res.render('home', {data: data});

  })
  ;
});
//Get a csv file from the server
function csvJSON(csvStr){
  
  var lines=csvStr.toString().split("\n");
  //remove \r from the end of the line
  lines=lines.map(function(line){
    return line.replace(/\r/g,'');
  });
  console.log(lines);
  var result = [];

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step 
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  var headers=lines[0].split(";");
  console.log(headers);

  for(var i=1;i<lines.length;i++){

      var obj = {};
      var currentline=lines[i].split(";");

      for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j].replace('null-','');
      }
     

      result.push(obj);

  }
  return result; //JavaScript object
}
app.get('/getallauthors', (req, res) => {
 const csvfile = fs.readFileSync('./csvfiles/authors.csv', 'utf8');
 const data = csvfile.toString().trim(); 

 const json = csvJSON(data);
  res.send(json);

})
app.get('/getauthors', async(req, res) => {
  // Parse the csv file
  const csvfile = fs.readFileSync('./csvfiles/authors.csv', 'utf8');
  const data = csvfile.toString().trim(); 
 
  const json = csvJSON(data);
   res.render('getauthors', {data: json});

}); 
app.get('/getbooks',async(req, res) => {
  const csvfile = fs.readFileSync('./csvfiles/books.csv', 'utf8');
  const data = csvfile.toString().trim(); 
 
  const json = csvJSON(data);
  res.render('getbooks', {data: json});


})
app.get('/getmagazines',async(req, res) => {
  const csvfile = fs.readFileSync('./csvfiles/magazines.csv', 'utf8');
  const data = csvfile.toString().trim(); 
 
  const json = csvJSON(data);
  console.log(json);
  
  res.render('getmagazines', {data: json});

})
app.post('/booksandmagazines',async(req, res) => {
  const csvfile1 = fs.readFileSync('./csvfiles/books.csv', 'utf8');
  const data1 = csvfile1.toString().trim();
  const csvfile2 = fs.readFileSync('./csvfiles/magazines.csv', 'utf8');
  const data2 = csvfile2.toString().trim();
  const json1 = csvJSON(data1);
  const json2 = csvJSON(data2);
  const json = json1.concat(json2);
  //Clear books_and_magazines.csv and write the new data according to the selected author
  fs.writeFileSync('./csvfiles/books_and_magazines.csv', '');
  const csv = json.map(row => Object.values(row).join(';')).join('\n');
  fs.appendFileSync('./csvfiles/books_and_magazines.csv', csv);
  //res.render('booksandmagazines', {data: json});
  res.send(json);


})
app.get('/formbooks', (req, res) => {
  res.render('addbooks');
})
app.post('/addbooks', async(req, res) => {
  // Add a new record to the csv file books.csv
  const title = req.body.title;
  const isbn = req.body.isbn;
  const authors=  req.body.authors;
  const description =  req.body.description;
  const append_data = `${title};${isbn};${authors};${description}\n`;
  //append after the last line to the file
  fs.appendFile('./csvfiles/books.csv', append_data, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  // const file_response = path.resolve(__dirname, 'csvfiles/books.csv');
  // const writeintofile = fs.appendFileSync(file_response, append_data);

 res.redirect('/getbooks');

})  

app.post('/addmagazines', async(req, res) => {
  // Add a new record to the csv file magazines.csv
  const title = req.body.title;
  const isbn = req.body.isbn;
  const authors=  req.body.authors;
  const publishedAt =  req.body.publishedAt;
  const append_data = `${title};${isbn};${authors};${publishedAt}\n`;
  //append after the last line to the file
  fs.appendFile('./csvfiles/magazines.csv', append_data, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
  res.redirect('/getmagazines');
})

app.get('/formmagazines', (req, res) => {
  res.render('addmagazines');
  })
app.listen(process.env.PORT || 3000, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});