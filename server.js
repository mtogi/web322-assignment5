/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Mustafa Toygar Baykal Student ID: 112398227 Date: November 18, 2023
*
*  Published URL: https://tiny-blue-bighorn-sheep-shoe.cyclic.app
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const path = require("path");

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get('/lego/addSet', async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render('addSet', { themes });
  } catch (err) {
    console.error(err);
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.post('/lego/addSet', async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    console.error(err);
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});


app.get("/lego/sets", async (req,res)=>{

  let sets = [];

  try{    
    if(req.query.theme){
      sets = await legoData.getSetsByTheme(req.query.theme);
    }else{
      sets = await legoData.getAllSets();
    }

    res.render("sets", {sets})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
  
});

app.get("/lego/sets/:num", async (req,res)=>{
  try{
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", {set})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
});

app.get('/lego/editSet/:num', async (req, res) => {
  try {
    const [set, themes] = await Promise.all([
      legoData.getSetByNum(req.params.num),
      legoData.getAllThemes(),
    ]);

    res.render('editSet', { set, themes });
  } catch (error) {
    res.status(404).render('404', { message: error.message });
  }
});

app.post('/lego/editSet', async (req, res) => {
  try {
    const setData = {
      name: req.body.name,
      year: req.body.year,
      num_parts: req.body.num_parts,
      img_url: req.body.img_url,
      theme_id: req.body.theme_id,
      set_num: req.body.set_num,
    };

    await legoData.editSet(req.body.set_num, setData);

    res.redirect('/lego/sets');
  } catch (error) {
    res.status(500).render('500', { message: `Error editing set: ${error.message}` });
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});