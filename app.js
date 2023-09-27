//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const watchingAnime = new Item ({
  name: "Waching Anime"
});

const sleeping = new Item ({
  name: "Sleeping"
});

const playGames = new Item ({
  name: "Playing Games"
});

const defultItems = [watchingAnime, sleeping, playGames];

// Item.find().then((results) => {
//   console.log(results);
// });
const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

  Item.find({}).then(async (results) => {
    if (results.length === 0) {
      await Item.insertMany(defultItems);
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});
    }
    
  });
  

});

app.get("/:customName", async (req, res) => {
  const customName = _.capitalize(req.params.customName);

  const foundedList = await List.findOne({name: customName});

  if (!foundedList) {
    const list = new List ({
      name: customName,
      items: defultItems
    });

    list.save();
    res.redirect("/" + customName);
  } else {
    res.render("list", {listTitle: foundedList.name, newListItems: foundedList.items})
  }
});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();

    res.redirect("/");
  } else {
    const foundList = await List.findOne({name: listName});

    foundList.items.push(newItem);
    foundList.save();
    res.redirect("/" + listName);
  }
  
});

app.post("/delete", async(req, res) => {
  const newItemId = req.body.checkBox;
  const nameList = req.body.nameList;

  if (nameList === "Today") {
    await Item.deleteOne({_id: newItemId});

    res.redirect("/");
  } else {
    await List.findOneAndUpdate({name: nameList}, {$pull: {items: {_id: newItemId}}});
    res.redirect("/" + nameList);
  }
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
