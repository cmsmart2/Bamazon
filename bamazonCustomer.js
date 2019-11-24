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
//Start function to show items and allow customer to buy or exit
function start() {
  connection.query("SELECT * FROM inventory", function(err, results) {
    if (err) throw err;
//Create and display table using easy table
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
  inquirer
    .prompt({
      name: "buyOrExit",
      type: "list",
      message: "Would you like to [BUY] an item or [EXIT] Bamazon?",
      choices: ["BUY", "EXIT"]
    })
    .then(function(answer) {
      if (answer.buyOrExit === "BUY") {
        purchaseItem(results);
     
      } else{
        connection.end();
      }
    });
  });
}
//function for purchasing items
function purchaseItem(items){
  inquirer
  .prompt([{
    name: 'item',
    type: 'input',
    message: 'Which Item would you like to purchase?',
  }]).then(function(answer){
      items.forEach(item => {
        if(item.product_name === answer.item){
          let purchase = answer.item
          let id = item.id-1;
          console.log('purchase ' + purchase)
          console.log('id '+ id)
          console.log(items[id])
          console.log("stock "+ items[id].stock_quantity)
          inquirer.prompt([{
            name: 'quantity',
            type: 'number',
            message: 'How many would you like to purchase?',
          }]).then(function(answer){
            if(items[id].stock_quantity-answer.quantity>=0){
              console.log("stock " +  items[id].stock_quantity)
              console.log("buying " + answer.quantity)
              connection.query("UPDATE inventory SET stock_quantity='"+(items[id].stock_quantity-answer.quantity)+"'WHERE product_name='"+purchase+"'", function(err, purchased){
                console.log(`Thanks you for your purchase!`)
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
