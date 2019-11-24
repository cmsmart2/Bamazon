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
  function addInventory (results){
    inquirer
    .prompt([{
      name: 'item',
      type: 'input',
      message: 'Which item would you like to add more inventory?',
    }]).then(function(answer){
        results.forEach(item => {
          if(item.product_name === answer.item){
            let product = answer.item
            console.log(product)
            let id = item.id-1;
            inquirer.prompt([{
              name: 'quantity',
              type: 'number',
              message: 'How many would you like to add?',
            }]).then(function(answer){
              if(results[id].stock_quantity+answer.quantity>=0){
                connection.query("UPDATE inventory SET stock_quantity='"+(results[id].stock_quantity+answer.quantity)+"'WHERE product_name='"+product+"'", function(err, product){
                  console.log(`You have updated the inventory`)
                  start();
                })
              }else{
                console.log("Not a Valid Selection!")
                start();
              }
            })
          }
      });
    });
  }
function addNewInventory (results){
    inquirer
    .prompt([
    {
        name: 'product_name',
        type: 'input',
        message: 'Which item would you like to add?'},
    {
        name: 'department_name',
        type: 'input',
        message: 'What department is it in?'},
    {
        name: 'price',
        type: 'number',
        message: 'How much does this item cost?'},
    {
        name: 'stock_quantity',
      type: 'number',
      message: 'How many of this item are for sale?'},
    ]).then (function(answer){
        let sql = `INSERT INTO inventory (product_name, department_name, price, stock_quantity) VALUES ("${answer.product_name}", "${answer.department_name}", "${answer.price}", "${answer.stock_quantity}")`;
        console.log(sql)
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            start();
        });
    })
}