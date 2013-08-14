//����������� ����

function GetLookupList(entity, attribute)
{
    var objectType = entity.Metadata[attribute].Type;
    var objectName = entity.Metadata[attribute].Name;
    var query = new Query();
    query.Text = String.Format("select * from {0}.{1}", objectType, objectName);
    return query.Execute(); 
}


function CreateOutletParameterValueIfNotExists(outlet,parameter,parameterValue)
{
    if(parameterValue!=null)
      return parameterValue;

    var p = DB.Create("Catalog.Outlet_Parameters");
    
    p.Ref = outlet.Id;   
    p.Parameter = parameter.Id; 
    
    if(parameter.DataTypeAsObject().Description == "Boolean")
      p.Value = false;
    else
      p.Value = "";

    return p;
}


function GetOutlets(searchText)
{
    query = new Query();
    if(String.IsNullOrEmpty(searchText))
    {
      query.Text = "select distinct(OutletAsObject) from Catalog.Territory_Outlets";
    }
    else
    {
      query.Text = "select distinct(OutletAsObject) from Catalog.Territory_Outlets where OutletAsObject.Description.Contains(@p1)";
      query.AddParameter("p1",searchText);
    }

    return query.Execute();
}


function GetScheduledVisits(searchText)
{
    var query = new Query();
    query.AddParameter("Date", DateTime.Now.Date);
    query.AddParameter("SearchText", searchText);

    if(String.IsNullOrEmpty(searchText))
      query.Text = "select * from Document.VisitPlan_Outlets where Date == @Date";
    else
      query.Text = "select * from Document.VisitPlan_Outlets where Date == @Date && OutletAsObject.Description.Contains(@SearchText)";

    return query.Execute();
}


function GetTodayVisit(outlet)
{
    var query = new Query();
    query.AddParameter("Date", DateTime.Now);
    query.AddParameter("Outlet", outlet.Id);
    query.Text = "select single(*) from Document.Visit where Outlet==@Outlet && Date==@Date";
    return query.Execute();
}


function CreatePlannedVisitIfNotExists(planVisit,outlet,userId)
{
    var query = new Query();
    query.AddParameter("Date", DateTime.Now.Date);
    query.AddParameter("Outlet", outlet.Id);
    query.Text = "select single(*) from Document.Visit where Outlet==@Outlet && Date==@Date";

    var visit = query.Execute();
    if(visit==null)
    {
      visit = DB.Create("Document.Visit");
      visit.Plan = planVisit.Id;
      visit.Outlet = outlet.Id;
      visit.SR = userId;
      visit.Date = DateTime.Now;
      visit.StartTime = DateTime.Now;

      var status = new Query("select single(*) from Enum.VisitStatus where Description=='Processing'").Execute();
      visit.Status = status.Id;

      visit.Encashment = 0;
    }
    
    return visit;
}

function GetOutletParameters()
{
    return new Query("select * from Catalog.OutletParameter").Execute();
}


function GetOutletParameterValue(outlet,parameter)
{
    var query = new Query();
    query.AddParameter("Outlet", outlet.Id);
    query.AddParameter("Parameter",parameter.Id);
    query.Text = "select single(*) from Catalog.Outlet_Parameters where Parameter == @Parameter && Ref == @Outlet";
    return query.Execute();
}


function GetTasks(outlet)
{
    var query = new Query();
    query.AddParameter("Date", DateTime.Now.Date);
    query.AddParameter("Outlet", outlet.Id);
    if(outlet==null)
        query.Text = "select * from Document.Task where PlanDate >= @Date";
    else
      query.Text = "select * from Document.Task where Outlet == @Outlet && PlanDate >= @Date";

    return query.Execute();
}


function CreateVisitTaskValueIfNotExists(visit,task)
{
    var query = new Query();
    query.AddParameter("Visit", visit.Id);
    query.AddParameter("Text", task.TextTask);
    query.Text = "select single(*) from Document.Visit_Task where Ref == @Visit && TextTask == @Text";
    var taskValue = query.Execute();
    if(taskValue==null)
    {
      taskValue = DB.Create("Document.Visit_Task");
      taskValue.Ref = visit.Id;
      taskValue.TextTask = task.TextTask;
      taskValue.TaskRef = task.Id;
    }

    return taskValue;
}


function GetQuestionsByOutlet(outlet)
{
    var query = new Query();
    query.AddParameter("OutletType", outlet.Type);
    query.Text = "select single(*) from Document.Questionnaire where OutletType == @OutletType";
    var obj = query.Execute();
    if(obj==null)
      return null;
    else
    {
      var query = new Query();
      query.AddParameter("Ref", obj.Id);
      query.Text = "select * from Document.Questionnaire_Questions where Ref == @Ref";
      return query.Execute(); 
    }


    return query.Execute();
}


function GetVisitQuestionValue(visit,question)
{
    var query = new Query();
    query.AddParameter("Visit", visit.Id);
    query.AddParameter("Question", question.Id);
    query.Text = "select single(*) from Document.Visit_Questions where Ref == @Visit && Question == @Question";
    return query.Execute();
}


function CreateVisitQuestionValueIfNotExists(visit,question,questionValue)
{
    if(questionValue!=null)
      return questionValue;

    var p = DB.Create("Document.Visit_Questions");
    
    p.Ref = visit.Id;   
    p.Question = question.Id; 
    
    if(question.AnswerTypeAsObject().Description == "Boolean")
      p.Answer = "false";
    else
      p.Answer = "";

    return p;
}


function GetSKUsByOutlet(outlet)
{
    var query = new Query();
    query.AddParameter("OutletType", outlet.Type);
    query.Text = "select single(*) from Document.Questionnaire where OutletType == @OutletType";
    var obj = query.Execute();
    if(obj==null)
      return null;
    else
    {
      var query = new Query();
      query.AddParameter("Ref", obj.Id);
      query.Text = "select * from Document.Questionnaire_SKUs where Ref == @Ref";
      return query.Execute(); 
    }


    return query.Execute();
}


function GetVisitSKUValue(visit,sku)
{
    var query = new Query();
    query.AddParameter("Visit", visit.Id);
    query.AddParameter("SKU", sku.Id);
    query.Text = "select single(*) from Document.Visit_SKUs where Ref == @Visit && SKU == @SKU";
    return query.Execute();
}


function CreateVisitSKUValueIfNotExists(visit,sku,skuValue)
{
    if(skuValue!=null)
      return skuValue;

    var p = DB.Create("Document.Visit_SKUs");
    
    p.Ref = visit.Id;   
    p.SKU = sku.Id;
    p.Available = false;

    return p;
}


function UpdateValueAndBack(entity,attribute,value,order)
{
    entity[attribute] = value;
    //if (order != null) {
    //    Workflow.DoAction(Select, order, entity.SKUAsObject(), entity);
    //}
    //else
        Workflow.Back();

}


//------------------------------UnscheduledVisit--------------

function CreateUnschVisitIfNotExists(outlet, userId, visit) {
    
    if (visit == null) {
        visit = DB.Create("Document.Visit");
        visit.Outlet = outlet.Id;
        visit.SR = userId;
        visit.Date = DateTime.Now;
        visit.StartTime = DateTime.Now;
        visit.Lattitude = GPS.Latitude;
        visit.Longitude = GPS.Longitude;

        var status = new Query("select single(*) from Enum.VisitStatus where Description=='Processing'").Execute();
        visit.Status = status.Id;

        visit.Encashment = 0;
    }

    return visit;
}


//------------------------------Order func-------------------------

function GetOrderList() {

    var query = new Query();
    query.Text = "select * from Document.Order";
    return query.Execute();

}

function GetOrderStatus(order) {

    return order.StatusAsObject().Description;

}

function AssignNumberIfNotExist(order) {

    if (order.Number == null) {
        var number = "noNumber";
    }
    else {
        var number = order.Number;
    }

    return number;

}

function CreateOrderIfNotExists(order, outlet, userId, visitId, executedOrder) {

    if (executedOrder != null) {
        order = executedOrder;
    }
    else {
        if (order == null) {
                var order = DB.Create("Document.Order");
                order.Date = DateTime.Now;
                order.Outlet = outlet.Id;
                order.SR = userId;
                order.DeliveryDate = DateTime.Now;
                var status = new Query("select single(*) from Enum.OrderSatus where Description=='New'").Execute();
                order.Status = status.Id;
                if (visitId != null) {
                    order.Visit = visitId;
                }
            }
    }

    return order;
}

function GetOrderedSKUs(orderId) {

    var query = new Query();
    query.AddParameter("orderId", orderId);
    query.Text = "select * from Document.Order_SKUs where Ref==@orderId";
    return query.Execute();

}

function GetOrderQTY(orderId) {

    var query = new Query();
    query.AddParameter("orderId", orderId);
    query.Text = "select sum(Qty) from Document.Order_SKUs where Ref==@orderId";
    return query.Execute();

}

function GetOrderSUM(orderId) {

    var query = new Query();
    query.AddParameter("orderId", orderId);
    query.Text = "select sum(Qty*Total) from Document.Order_SKUs where Ref==@orderId";
    return query.Execute();

}

function GetSKUAmount(orderId,item){

    var query = new Query();
    query.AddParameter("orderId", orderId);
 
    query.AddParameter("itemId", item.Id);
    query.Text = "select sum(Qty*Total) from Document.Order_SKUs where Ref==@orderId && Id==@itemId";
    return query.Execute();

}

function CreateOrderItemIfNotExist(orderId,sku,orderitem,unit){//,newUnit) {

    if (orderitem == null) {

        var p = DB.Create("Document.Order_SKUs");
        p.Ref = orderId;
        p.SKU = sku.Id;
        p.Price = sku.Price;
        p.Total = sku.Price;
        p.Units = sku.BaseUnit;
        
        return p;
    }
    else {
        orderitem.Total = (orderitem.Price * (orderitem.Discount / 100 + 1));
        if (unit != null)
            orderitem.Units = unit.Pack;

        return orderitem;
    }

}

function CalculatePrice(price,discount) {

    var total = (price * (discount/100 + 1));
    return total

}

function GetUnits(skuId){

    var units = new Query();
    units.AddParameter("skuId", skuId);
    units.Text = "select * from Catalog.SKU_Packing where Ref==@skuId";
    return units.Execute();

}

function UpdateAndRefresh(entity, attribute, value){//, param1, param2, param3) {
    entity[attribute] = value;
    //Workflow.DoRefresh(param1,param2,param3);
}


    //----------------------------GetSKUs-------------------------


    function GetSKUs(searchText, owner) {
        if (owner == null) {
            query = new Query();
            if (String.IsNullOrEmpty(searchText)) {
                query.Text = "select * from Catalog.SKU";
            }
            else {
                query.Text = "select * from Catalog.SKU where Description.Contains(@p1)";
                query.AddParameter("p1", searchText);
            }
        }
        else {
            query = new Query();
            query.AddParameter("owner", owner);
            if (String.IsNullOrEmpty(searchText)) {
                query.Text = "select * from Catalog.SKU where Owner==@owner";
            }
            else {
                query.Text = "select * from Catalog.SKU where Description.Contains(@p1) && Owner==@owner";
                query.AddParameter("p1", searchText);
            }
        }

        return query.Execute();
    }

    function GetSKUGroups(searchText) {
        query = new Query();
        
        if (String.IsNullOrEmpty(searchText)) {
            query.Text = "select distinct(OwnerAsObject) from Catalog.SKU";
        }
        else {
            query.Text = "select distinct(OwnerAsObject) from Catalog.SKU where Description.Contains(@p1)";
            query.AddParameter("p1", searchText);
        }

        return query.Execute();
    }

    function checkSKUGroup(group,userId)
    {
        var query = new Query;
        query.AddParameter("group", group);
        query.Text = "select count(Id) from Catalog.Territory_SKUGroups where SKUGroup==@group";
        return query.Execute();
  
    }


    //-------------------------------Stocks--------------------

