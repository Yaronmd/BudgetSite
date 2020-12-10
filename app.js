// anonymous controller function

// BUDGET CONTROLLER
var budgetController = (function () {

  var Expense = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1
  };
  Expense.prototype.calcPercentages = function(totalIncome){
    if (totalIncome > 0 ){
      this.percentage = Math.round((this.value / totalIncome)*100);
    }else{
      this.percentage = -1
    }
  
  };
  Expense.prototype.getPercentage = function(){
    return this.percentage;
  }

  var Income = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
  
      data.allItems[type].forEach(function (cur){
        sum += cur.value;

      })
      data.totals[type] = sum
    

  };

  var data = {
    allItems: {
      exp:[],
      inc :[]
    },
    totals:{
      exp :0,
      inc:0
    },
    budget:0,
    percentage: -1
  };

  return {
    addItem:function(type,des,val){
    
      var newItem,ID;
      // [1 2 3 4 5], next id = 6
      // ID = last ID + 1 
      // create new ID
      if(data.allItems[type].length >0){
        ID = data.allItems[type][data.allItems[type].length -1].id + 1;
      }
      else{
        ID = 0
      }
     

      // create new item based on 'inc' or 'exp' type
      if(type ==='exp'){
        newItem =  new Expense(ID,des,val)
      }
      else if (type==='inc'){
        newItem =  new Income(ID,des,val)
      }
      // Push it into data structure
      data.allItems[type].push(newItem)

      // return new item
      return newItem
    
    },
    testing:function(){
      console.log(data)
    },
    deleteItem:function(type,id){
      var ids,index

      //id =6 
      //ids = [1,2,3,6,4]
      // getting all ids
      ids = data.allItems[type].map(function(current){
        return current.id;

      });
      //index = 3
      index = ids.indexOf(id);

      //removing 
      if(index !== -1){
        data.allItems[type].splice(index,1);
      }

      
    },
    calculatePercentages:function(){

      data.allItems.exp.forEach(function(cur){

        cur.calcPercentages(data.totals.inc);
      })

    },
    getPercentages: function(){
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage()
      });
      return allPerc

    },
    calculateBudget:function(){

      //calculate total income and expanses
      calculateTotal('exp')
      calculateTotal('inc')
      //calculate the budget : income - expense
      data.budget = data.totals.inc - data.totals.exp;
      //calculate the percentage of income
      if (data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
      }
      else{
        data.percentage = -1;
      }
      
    },
    getBudget:function(){
      return {
        budget:data.budget,
        totalInc:data.totals.inc,
        totalExp:data.totals.exp,
        percentage:data.percentage
      }
    }

  };


})();

// UI CONTROLLER
var UIController = (function () {

  var DOMStrings = {
      inputType:'.add__type',
      inputDescription: '.add__description',
      inputValue:'.add__value',
      inputButton:'.add__btn',
      incomeContainer :".income__list",
      expensesContainer : ".expenses__list",
      budgetLabel:'.budget__value',
      incomeLabel:'.budget__income--value',
      expenseLabel:'.budget__expenses--value',
      percentageLabel:'.budget__expenses--percentage',
      container:'.container',
      expensesPercentageLabel: '.item__percentage',
      dateLabel:'.budget__title--month'

  };
  var formatNumber = function(num,type){
    var numSplit,int,dec;
    // + or  - before numbers and 2 decimal
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0]
    dec = numSplit[1]

    if( int.length>3)
    {
     int =  int.substr(0,int.length-3) + ','+ int.substr(int.length - 3,3); // input 2000 -> 2,000  | 23500 -> 23,500
    }


    return (type === 'exp' ? '-': '+') + ' ' + int+'.'+dec

  };
  var nodeListForEach = function(list,callback){
    for (var i=0;i<list.length;i++){
      callback(list[i],i);
    }

  };

  return {
    // get the inputs from the index
    getInput: function (){
      return {
        type: document.querySelector(DOMStrings.inputType).value, //will be inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat( document.querySelector(DOMStrings.inputValue).value)
      };
    },

    clearFields: function () {
      var fields,fieldsArr;
      fields = document.querySelectorAll(DOMStrings.inputDescription+ ', '+DOMStrings.inputValue);

      fieldsArr =  Array.prototype.slice.call(fields)


      fieldsArr.forEach((current,index,array)=>{
        current.value = "";
      });

      fieldsArr[0].focus()

    },
    displayBudget: function(obj){
     
       document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,(obj.budget>0 ? 'inc':'exp'));
       document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
       document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
       

       if(obj.percentage > 0 ){
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'
       }
       else{
        document.querySelector(DOMStrings.percentageLabel).textContent = '---'
       }

    },
    displayPercentages:function(percentages){

      var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

   

      nodeListForEach(fields,function(current,index){
        if (percentages[index]>0){
          current.textContent = percentages[index]+ '%';
        }
        else{
          current.textContent = '---';
        }
       
      })
    },
    displayMonth:function(){
      var now,year,month,months
       now = new Date();
       months = ['January','February','March','April','May','June','July','August','September','October','November','December']
       month = now.getMonth();
       year = now.getFullYear();

      document.querySelector(DOMStrings.dateLabel).textContent = months[month]+ ' ' +year;



    },
    changedType:function(){

      var fields = document.querySelectorAll(
        DOMStrings.inputType +','+
        DOMStrings.inputDescription +','+
        DOMStrings.inputValue
        )
        nodeListForEach(fields,function(cur){
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMStrings.inputButton).classList.toggle('red')

    },
    getDOMStrings: function () {
      return DOMStrings
    },
    addListItem:function (obj,type){
      var html,newHtml,element
      // create html string with placeholder text
      if(type  === 'inc'){
        element = DOMStrings.incomeContainer
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      }
      else if (type  === 'exp'){
        element = DOMStrings.expensesContainer
        html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } 
      //replace the placeholder text with some data
      newHtml = html .replace('%id%',obj.id)
      newHtml  = newHtml.replace('%description%',obj.description)
      newHtml = newHtml.replace('%value%',formatNumber(obj.value,type))

      //insert the html into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)


      
    },
    deleteListItem:function(selectorID){
      var el =  document.getElementById(selectorID)

      el.parentNode.removeChild(el)

    }

  };
  
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

  var DOM = UICtrl.getDOMStrings();

  var setupEventListeners = function (){
      //class selector adding event listener when add item pressed
      document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);

      //event listener when enter pressed
      document.addEventListener('keypress',function(event){
    
      if(event.keyCode === 13 || event.which === 13){
        ctrlAddItem()
      }

      document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem)

      document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType)

  })};
  

  var updateBudget = function(){
    // 1. Calculate the budget
    budgetCtrl.calculateBudget()
    // 2.return the budget
    var budget = budgetCtrl.getBudget()
    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget)
  };
  var updatePercentages = function(){

    //1. calc Percentages
    budgetCtrl.calculatePercentages()


    //2. read from budget controller
    var percentages = budgetCtrl.getPercentages()
    console.log(percentages)

    //3. update the UI with new percentages
    UICtrl.displayPercentages(percentages)

  }
  //setup event listener
  var ctrlAddItem = function (){

    var input,newItem
     //TO DO
    // 1. get the field input data
    input = UICtrl.getInput()

    if (input.description !== "" && !isNaN(input.value) && input.value > 0){
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type,input.description,input.value)

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem,input.type)

      // 4. clear fields
      UICtrl.clearFields()

      // 5. calc and update budget
      updateBudget()

      //6. calc and update Percentages
      updatePercentages()
    }

  };

  var ctrlDeleteItem = function(event){
    var itemID,splitID,type,ID;
    // to get the id of income or exp
    itemID =  event.target.parentNode.parentNode.parentNode.parentNode.id

    if (itemID){

      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data 
      budgetCtrl.deleteItem(type,ID);
      // 2. delete the item from the interface
      UICtrl.deleteListItem(itemID)
      //3.update and show the budget
      updateBudget()
      //4.update Percentages
      updatePercentages()


    }


  }

  return {
    init:function (){
      console.log("Application has started.")
      // init with 0
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget:0,
        totalInc:0,
        totalExp:0,
        percentage:-1
      });
      setupEventListeners();
      
    }
  }
 

})(budgetController, UIController);
 

controller.init();