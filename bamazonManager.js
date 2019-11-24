const mysql = require("mysql");
const inquirer = require("inquirer");
const Table = require('easy-table')

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon_DB"
});
connection.connect(function(err) {
    if (err) throw err;
    start();
  });
  //Start function to allow manager to View Products for Sale, View Low Inventory, Add to Inventory, and Add New Product
  function start() {
    connection.query("SELECT * FROM inventory", function(err, results) {
      if (err) throw err;
    inquirer
      .prompt({
        name: "managerScreen",
        type: "list",
        message: "Would you like to [VIEW] products, [VIEWLOW] inventory, [ADD] to inventory, [ADDNEW] product or [EXIT] Bamazon?",
        choices: ["VIEW", "VIEWLOW", "ADD", "ADDNEW", "EXIT"]
      })
      .then(function(answer) {
        if (answer.managerScreen === "VIEW") {
          viewInventory(results);
        }else if(answer.managerScreen === "VIEWLOW"){
            viewLowInventory(results);
        }else if(answer.managerScreen === "ADD"){
            addInventory(results);
        }else if(answer.managerScreen === "ADDNEW"){
            addNewInventory(results);
        }else{
          connection.end();
        }
      });
    });
  }

  function viewInventory(results){
    const t = new Table
    results.forEach(function(item) {
      t.cell('Product Id', item.id)
      t.cell('Name', item.product_name)
      t.cell('Department', item.department_name)
      t.cell('Price', item.price, Table.number(2))
      t.cell('Quantity', item.stock_quantity, Table.number(0))
      t.newRow()
    })
    console.log(t.toString())
    start();
  }
  function viewLowInventory(results){
    const t = new Table
    results.forEach(function(item) {
    if(item.stock_quantity <= 5){
      t.cell('Product Id', item.id)
      t.cell('Name', item.product_name)
      t.cell('Department', item.department_name)
      t.cell('Price', item.price, Table.number(2))
      t.cell('Quantity', item.stock_quantity, Table.number(0))
      t.newRow()
    }
    })
    console.log(t.toString())
    start();
  }
