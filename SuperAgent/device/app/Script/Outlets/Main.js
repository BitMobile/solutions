﻿var snapshotsExists;
var singlePicture;
var parameterValueC;
var title;
var back;
var outletDesc;
var backvisit;
var DateAddTru;
var NameControl;
var OutNow;
//"description"	= "000000001"
//"address"			= "000000002"
//"coordinates" = "000000003"
//"type"				= "000000004"
//"class"				= "000000005"
//"distributor" = "000000006"
//"status"			= "000000007"
//"snapshots"		= "000000008"
function OnLoad(){
	if ($.workflow.name=='Visit') {
		//Dialog.Message($.MeropCur.WithRuk);
		$.ChkBox.Checked = $.Merop.WithRuk;

	}
}
function OnLoading() {

	query = new Query("SELECT Editable, Code FROM Catalog_OutletsPrimaryParametersSettings");

	parameterList = query.Execute();

	var primaryParametersSettings = new Dictionary();

	while (parameterList.Next()) {

		primaryParametersSettings.Add(parameterList.Code, parameterList.Editable);

	}

	$.Add("primaryParametersSettings", primaryParametersSettings);

	var existorno = new Query("Select type From sqlite_master where name = 'UT_answerQuest' And type = 'table'");
	var exorno = existorno.ExecuteCount();
	if (exorno > 0) {
		var checkansquest = new Query("Select id From UT_answerQuest");
		var counnurows = checkansquest.ExecuteCount();
		if (counnurows>0) {
			backvisit = Translate["#back#"];
		}else {
			backvisit = Translate["#" + Lower(GlobalWorkflow.GetMenuItem()) + "#"];
		}
	}
	else {
		backvisit = Translate["#" + Lower(GlobalWorkflow.GetMenuItem()) + "#"];
	}
	title = Translate["#outlet#"];
	if ($.workflow.name=='Visit') {
		DateAddTru = GlobalWorkflow.GetDateAdd();
	}
	else {
		DateAddTru = false;
	}

}

function LoadObject(val){
	if (val == null) {
		var existorno = new Query("Select type From sqlite_master where name = 'UT_answerQuest' And type = 'table'");
		var exorno = existorno.ExecuteCount();
		if (exorno > 0) {
			var checkansquest = new Query("Select outlet From UT_answerQuest");
			var outletref = checkansquest.ExecuteScalar();
		}
	}else {
		outletref = val;
	}
	OutNow = outletref;
	return outletref.GetObject();
}

function HasMenu(){

	return GlobalWorkflow.GetMenuItem() == "Outlets" ? true : false;
}

function ChoseFromCatalog(Name){
	var tabelName = "";
	var startKey = "";
	NameControl = Name;
	if (Name == "Segment") {
		tabelName = "Catalog_BitSegment";
//		NameControl = Name;
		startKey = OutNow.Segment;
	}
	if (Name == "TypeOrg") {
		tabelName = "Catalog_OrgType";
//		NameControl = Name;
		startKey = OutNow.OrgType;
	}
	if (Name == "Profile") {
		tabelName = "Catalog_Profile";
		startKey = OutNow.Profile;
	}
	if (Name == "MaybeDeal") {
		tabelName = "Catalog_MayBeDeal";
		startKey = $.workflow.visit.FactMerop.MayBeDeal;
	}
	if (Name == "TypeMer") {
		tabelName = "Catalog_MeropType";
		startKey = $.workflow.visit.FactMerop.TypeMeropr;
	}

//	var items = [];
	if (Name == "MaybeDeal") {
		var query = new Query("Select Id,Description From "+tabelName+" Where Outlet = @Outl UNION Select '@ref["+tabelName+"]:00000000-0000-0000-0000-000000000000','—'");
		query.AddParameter("Outl",OutNow);
	}else {
		if (Name == "Profile") {
			var query = new Query("Select CO.Id, CO.Description From Catalog_OrgType_Profile OP LEFT JOIN Catalog_Profile CO ON CO.Id = OP.Profile Where OP.Ref = @OrgTypeRef UNION Select '@ref["+tabelName+"]:00000000-0000-0000-0000-000000000000','—'");
			query.AddParameter("OrgTypeRef",OutNow.OrgType);
		}else {
			var query = new Query("Select Id,Description From "+tabelName+" UNION Select '@ref["+tabelName+"]:00000000-0000-0000-0000-000000000000','—'");
		}
	}
	if (Name == "Profile" && OutNow.OrgType == "@ref[Catalog_OrgType]:00000000-0000-0000-0000-000000000000") {
		Dialog.Message("Выберите сначала тип организации");
	}else {
		Dialog.Choose("#select_answer#"
		, query.Execute()
		,	startKey
		, SaveAnswerCatalog);
	}
}
function ValueEmpty(NameVal){
	if (NameVal == "contactName") {
		if ($.Merop.ContactPerson == "@ref[Catalog_ContactPersons]:00000000-0000-0000-0000-000000000000") {
			return true;
		}else {
			return false;
		}
	}
	if (NameVal == "MaybeDeal") {
		if ($.Merop.MayBeDeal == "@ref[Catalog_MayBeDeal]:00000000-0000-0000-0000-000000000000") {
			return true;
		}else {
			return false;
		}
	}
	if (NameVal == "TypeMer") {
		if ($.Merop.TypeMeropr == "@ref[Catalog_MeropType]:00000000-0000-0000-0000-000000000000") {
			return true;
		}else {
			return false;
		}
	}
	if (NameVal == "GoalContains") {
		if ($.Merop.GoalContains == null) {
			return true;
		}else {
			return false;
		}
	}

}
function SaveAnswerCatalog(state, args){
	//Dialog.Message(args.Result);
	if (args.Value == "—") {
		Variables[NameControl].Text = "—";
	}else {
		Variables[NameControl].Text = args.Result.Description;
	}
	if (NameControl == "TypeMer" || NameControl == "MaybeDeal") {
		 var objMerop =	$.workflow.visit.FactMerop.GetObject();
		 if (NameControl == "TypeMer") {
			 objMerop.TypeMeropr = args.Result;
			 objMerop.Save();
		 }
		 if (NameControl == "MaybeDeal") {
			 objMerop.MayBeDeal = args.Result;
			 objMerop.Save();
		 }

	}else {
		var outletObj = OutNow.GetObject();
		if (NameControl == "Segment") {
			outletObj.Segment = args.Result;
		}
		if (NameControl == "Profile") {
			outletObj.Profile = args.Result;
		}
		if (NameControl == "TypeOrg") {
			$.Profile.Text = "—";
			outletObj.Profile = DB.EmptyRef("Catalog_Profile");
			outletObj.OrgType = args.Result;
		}
		outletObj.Save();
	}

}
function GetOutlets(searchText) {
	var search = "";
	var showOutlet = "";
	var createOrder ="";
	var createReturn = "";
	var outletStatus = "";
	var q = new Query();

	if (String.IsNullOrEmpty(searchText)==false) { //search processing
		searchText = StrReplace(searchText, "'", "''");
		search = "WHERE Contains(O.Description, '" + searchText + "') Or Contains(O.Address, '" + searchText + "')";
	}

	var currentDoc = GlobalWorkflow.GetMenuItem();

	if (currentDoc=="Outlets") {  //ShowOutletInMA for Outlets.xml at Outlets workflow
		showOutlet = " JOIN Catalog_OutletsStatusesSettings OS ON OS.Status=O.OutletStatus AND ShowOutletInMA=1 ";
	}

	if (currentDoc=="Orders") {  //CreateOrderInMA for Outlets.xml at Order workflow
		createOrder = " JOIN Catalog_OutletsStatusesSettings OS ON OS.Status=O.OutletStatus AND CreateOrderInMA=1 ";
	}

	if (currentDoc=="Returns"){
		createReturn = " JOIN Catalog_OutletsStatusesSettings OS ON OS.Status=O.OutletStatus AND CreateReturnInMA=1 ";
	}

	if ($.sessionConst.encashEnabled){
		outletStatus = "(SELECT CASE WHEN COUNT(DISTINCT D.Overdue) = 2 THEN 2	WHEN COUNT(DISTINCT D.Overdue) = 0 THEN 3 " +
		"ELSE (SELECT D1.Overdue FROM Document_AccountReceivable_ReceivableDocuments D1 " +
		"JOIN Document_AccountReceivable A1 ON D1.Ref=A1.Id WHERE A1.Outlet = O.Id LIMIT 1) END AS st " +
		"FROM Document_AccountReceivable_ReceivableDocuments D JOIN Document_AccountReceivable A ON D.Ref=A.Id " +
		"WHERE A.Outlet=O.Id) AS OutletStatus";
	}
	else
		outletStatus = " 3 AS OutletStatus";

	q.Text = "SELECT O.Id, O.Description, O.LegalName, 'main_row' AS Style, " + outletStatus +
		" FROM Catalog_Outlet O " +
		showOutlet + createOrder + createReturn + search + " ORDER BY O.Description LIMIT 500";

	return q.Execute();
}

function AddGlobalAndAction(outlet) {

	var actionName = "";
	var curr = GlobalWorkflow.GetMenuItem();

	if (curr=="Outlets")
		actionName = "Select";
	else{
		if (HasContractors1(outlet)){
			if (curr == "Orders")
				actionName = "CreateOrder";
			if (curr == "Returns")
				actionName = "CreateReturn";
		}
		else{
			Dialog.Message(Translate["#noContractorsMessage#"]);
		}
	}

	if (actionName != ""){
		GlobalWorkflow.SetOutlet(outlet);
		Workflow.Action(actionName, []);
	}

}

function CreateOutletAndForward() {
	var p = DB.Create("Catalog.Outlet");
	p.Lattitude = 0;
	p.Longitude = 0;
	p.Save();
	var parameters = [ p ];
	Workflow.Action("Create", parameters);
}

function CreateVisitEnable() {
	if ($.sessionConst.PlanEnbl && $.workflow.name == "Outlet")
		return true;
	else
		return false;

}

function CreateOutletEnabled(){
	if (GlobalWorkflow.GetMenuItem() == "Outlets")
		return true;
	else
		return false;

}

function EmptyCoordinates(outlet){
	return !!(outlet != null && Converter.ToDecimal(outlet.Lattitude)!= Converter.ToDecimal(outlet.Longitude));
}
function CashDesc(sender,tempoutlet){
	var outlet=tempoutlet.GetObject();
	outletDesc=outlet.Description;
}
function CheckForNullDesc(sender,tempoutlet){
	var outlet=tempoutlet.GetObject();
	var descString=TrimAll(outlet.Description);
	if (IsNullOrEmpty(descString)){
		outlet.Description=outletDesc;
		$.outletDescr.Text=outletDesc;
		outlet.Save();
	}
	//$.outletDescr.CssClass="main_row";
	//$.outletDescr.Refresh();
	//Workflow.Refresh([]);
	}

function SaveValue(control, ref) {
	var outlet = ref.GetObject();
	outlet.Address = control.Text;
	outlet.Save();
}

function GetOutletParameters(outlet) {

	var query = new Query();

	query.Text = "SELECT P.Id, P.Description, P.DataType, DT.Description AS TypeDescription, OP.Id AS ParameterValue, OP.Value, P.Visible, P.Editable " +
			", CASE WHEN P.DataType=@integer OR P.DataType=@decimal OR P.DataType=@string THEN 1 ELSE 0 END AS IsInputField " + //IsInputField
			", CASE WHEN P.DataType=@integer OR P.DataType=@decimal THEN 'numeric' ELSE 'auto' END AS KeyboardType " +
			", CASE WHEN P.DataType=@integer OR P.DataType=@decimal OR P.DataType=@string THEN OP.Value " +
					"ELSE CASE WHEN OP.Value IS NULL OR RTRIM(OP.Value)='' THEN '—' " +
										"WHEN OP.Value IS NOT NULL AND P.DataType=@snapshot THEN @attached " +
										"WHEN OP.Value IS NOT NULL AND P.DataType!=@snapshot THEN OP.Value " +
					"END END AS AnswerOutput " +
			", CASE WHEN P.DataType=@snapshot THEN " +
					"CASE WHEN TRIM(IFNULL(OFILES.FullFileName, '')) != '' THEN LOWER(OFILES.FullFileName) ELSE '/shared/result.jpg' END ELSE NULL END AS FullFileName " +
			"FROM Catalog_OutletParameter P " +
			"JOIN Enum_DataType DT ON DT.Id=P.DataType " +
			"LEFT JOIN Catalog_Outlet_Parameters OP ON OP.Parameter = P.Id AND OP.Ref = @outlet " +
			"LEFT JOIN Catalog_Outlet_Files OFILES ON OP.Value = OFILES.FileName AND OFILES.Ref = @outlet";

	query.AddParameter("integer", DB.Current.Constant.DataType.Integer);
	query.AddParameter("decimal", DB.Current.Constant.DataType.Decimal);
	query.AddParameter("string", DB.Current.Constant.DataType.String);
	query.AddParameter("snapshot", DB.Current.Constant.DataType.Snapshot);
	query.AddParameter("outlet", outlet);
	query.AddParameter("attached", Translate["#snapshotAttached#"]);

	return query.Execute();

}

function UseInput(typeDescription) {
	if (typeDescription != "Integer" && typeDescription != "Decimal" && typeDescription != "String")
		return false;
	else
		{
		if (typeDescription == "Integer" || typeDescription == "Decimal")
			$.Add("keyboardType", "numeric");
		else
			$.Add("keyboardType", "auto");
		}
		return true;
}

function GetOutletParameterValue(outlet, parameter, parameterValue, type) {
	if (type == 'Snapshot')
		return GetSnapshotText(parameterValue);
	if (parameterValue == null)
		return "";
	else
		return parameterValue.Value;
}

function GetSnapshotText(text) {
	if (String.IsNullOrEmpty(text.Value))
		return Translate["#noSnapshot#"];
	else
		return Translate["#snapshotAttached#"];
}

function CheckNotNullAndForward(outlet, visit) {
	var c = CoordsChecked(visit);
	if ((CheckEmptyOutletFields(outlet) && c) || DateAddTru == true) {
		outlet.GetObject().Save();
		ReviseParameters(outlet, false);
		var NotExecutedTask = GetNotExecutedTasks();
		//Dialog.Message(NotExecutedTask);
		if (NotExecutedTask==0) {
			Workflow.Action("SkipTask",[]);
		}else {
			Workflow.Forward([]);
		}
	}
}

function GetNotExecutedTasks() {
	var q = new Query;

	var outlet = "";

	if ($.workflow.name == "Visit"){
		q.AddParameter("outlet", GlobalWorkflow.GetOutlet());
		outlet = " AND DT.Outlet=@outlet ";
	}

if ($.workflow.name == "Visit") {
	var dateAddNumber = GlobalWorkflow.GetDateAddNumber();
	q.Text = "SELECT O.Description AS Outlet, DT.Id, DT.TextTask " +
		" , CASE WHEN DT.EndPlanDate='0001-01-01 00:00:00' OR DT.StartPlanDate IS NULL THEN 2 ELSE 1 END AS DateOrder " +
		" , CASE WHEN DT.EndPlanDate='0001-01-01 00:00:00' OR DT.EndPlanDate IS NULL THEN @notLimited ELSE DT.EndPlanDate END AS EndPlanDate " +
		" FROM Document_Task DT " +
		" JOIN Catalog_Outlet O ON DT.Outlet=O.Id " +
		" WHERE DT.Status=0 " +
		" AND (DT.StartPlanDate<=@dayPlanVis OR DT.StartPlanDate IS NULL) " + outlet +
		" ORDER BY DateOrder, DT.EndPlanDate, O.Description";
		q.AddParameter("dayPlanVis", DateTime.Now.Date.AddDays(dateAddNumber));
		//Dialog.Message(DateTime.Now.Date.AddDays(dateAddNumber));
}else {
q.Text = "SELECT O.Description AS Outlet, DT.Id, DT.TextTask " +
	" , CASE WHEN DT.EndPlanDate='0001-01-01 00:00:00' OR DT.StartPlanDate IS NULL THEN 2 ELSE 1 END AS DateOrder " +
	" , CASE WHEN DT.EndPlanDate='0001-01-01 00:00:00' OR DT.EndPlanDate IS NULL THEN @notLimited ELSE DT.EndPlanDate END AS EndPlanDate " +
	" FROM Document_Task DT " +
	" JOIN Catalog_Outlet O ON DT.Outlet=O.Id " +
	" WHERE DT.Status=0 " +
	" AND (DATE(DT.StartPlanDate)<=DATE('now', 'localtime') OR DT.StartPlanDate IS NULL) " + outlet +
	" ORDER BY DateOrder, DT.EndPlanDate, O.Description";

}
		q.AddParameter("notLimited", Translate["#notLimited#"]);

	return q.ExecuteCount();
}


function ReviseParameters(outlet, save) {
	var q =
			new Query("SELECT Id, Value FROM Catalog_Outlet_Parameters WHERE Ref=@ref");
	q.AddParameter("ref", outlet);
	var param =
			q.Execute();

	while (param.Next()) {
		if (save)
			param.Id.GetObject().Save(false);
	}
}

//---------------------------header parameters dialog.choose--------------------

function SelectIfNotAVisit(outlet, attribute, control, title, editOutletParameters, primaryParameterName) {
	if ($.workflow.name != "Visit") {
		if (editOutletParameters && $.primaryParametersSettings[primaryParameterName]) {

			var listChoice = null;

			if (title == Translate["#status#"]) {
				var query = new Query("SELECT Id, Description FROM Enum_OutletStatus");
				listChoice = query.Execute();
				var table = [];
				while (listChoice.Next()) {
					table.push([listChoice["Id"], Translate[String.Format("#{0}#", listChoice.Description)]]);
				}
				listChoice = table;
			}

			if (title == Translate["#partner#"]){
				var query = new Query("SELECT DISTINCT D.Id, D.Description " +
					" FROM Catalog_Distributor D " +
					" JOIN Catalog_Territory_Distributors TD ON D.Id=TD.Distributor " +
					" JOIN Catalog_Territory_Outlets T ON TD.Ref=T.Ref AND T.Outlet=@outlet " +
					" UNION SELECT @emptyRef, '-'" +
					" ORDER BY Description ");
				query.AddParameter("outlet", outlet);
				query.AddParameter("emptyRef", DB.EmptyRef("Catalog.Distributor"));
				listChoice = query.Execute();
			}

			Dialogs.DoChoose(listChoice, outlet, attribute, control, null, title);
		}
	}
}

function GetDescr(outlet){
	//Dialog.Message(outlet);
	var q = new Query("Select D.Description As Desc From Catalog_Outlet O LEFT JOIN Catalog_Distributor D ON O.Distributor=D.Id	Where O.Id=@outlet");
	q.AddParameter("outlet",outlet);
	var result = q.ExecuteScalar();
	var descdistr = result;
	return String.IsNullOrEmpty(descdistr) ? "—" : descdistr;
}


function DistrCallBack(state, args){
	AssignDialogValue(state, args);
	var control = state[2];
	if (args.Result==DB.EmptyRef("Catalog.Distributor"))
		control.Text = "—";
	else
		control.Text = args.Result.Description;
}

//--------------------------editing additional parameters handlers-----------------------------

function CreateOutletParameterValue(outlet, parameter, value, parameterValue, isEditText) {
	var q = new Query("SELECT Id FROM Catalog_Outlet_Parameters WHERE Ref=@ref AND Parameter = @parameter");
	q.AddParameter("ref", outlet);
	q.AddParameter("parameter", parameter);
	parameterValue = q.ExecuteScalar();
	if (parameterValue == null) {
		parameterValue = DB.Create("Catalog.Outlet_Parameters");
		parameterValue.Ref = outlet;
		parameterValue.Parameter = parameter;
		parameterValue.Save();
	} else{
		parameterValue = parameterValue.GetObject();
		if (isEditText){
			if ((parameter.DataType).ToString() != (DB.Current.Constant.DataType.Snapshot).ToString())
			parameterValue.Value = value;
			parameterValue.Save();
		}
	}
	return parameterValue.Id;
}

function RoundToIntIfNeed(control, typeDescription, parameterValue, value, outlet, parameter){
	value = control.Text;
	isEditText = true;
	var q = new Query("SELECT Id FROM Catalog_Outlet_Parameters WHERE Ref=@ref AND Parameter = @parameter");
	q.AddParameter("ref", outlet);
	q.AddParameter("parameter", parameter);
	parameterValue = q.ExecuteScalar();
	if (parameterValue == null) {
		parameterValue = DB.Create("Catalog.Outlet_Parameters");
		parameterValue.Ref = outlet;
		parameterValue.Parameter = parameter;
		parameterValue.Save();
	} else{
		parameterValue = parameterValue.GetObject();
		if (isEditText){
			if ((parameter.DataType).ToString() != (DB.Current.Constant.DataType.Snapshot).ToString()){
				if ((parameter.DataType).ToString() == (DB.Current.Constant.DataType.Integer).ToString()){
					value = RoundToInt(value);
					parameterValue.Value = value;
				}
			}
			parameterValue.Save();
		}
	}
	control.Text=value;
}

function AssignParameterValue(control, typeDescription, parameterValue, value, outlet, parameter){
	CreateOutletParameterValue(outlet, parameter, control.Text, parameterValue, true)
}

function GoToParameterAction(typeDescription, parameterValue, value, outlet, parameter, control, parameterDescription, editable, index, isEditText) {

	if (editable && DateAddTru == false) {

		if ($.sessionConst.editOutletParameters) {
			parameterValue = CreateOutletParameterValue(outlet, parameter, parameterValue, parameterValue, isEditText);

			if (typeDescription == "ValueList") {  //--------ValueList-------
				var q = new Query();
				q.Text = "SELECT Value, Value FROM Catalog_OutletParameter_ValueList WHERE Ref=@ref UNION SELECT '', '—' ORDER BY Value";
				q.AddParameter("ref", parameter);
				Dialogs.DoChoose(q.Execute(), parameterValue, "Value", Variables[control], null, parameterDescription);
			}
			if (typeDescription == "DateTime") {  //---------DateTime-------
				if (String.IsNullOrEmpty(parameterValue.Value))
					Dialogs.ChooseDateTime(parameterValue, "Value", Variables[control], DateHandler, parameterDescription);
				else
					Dialog.Choose(parameterDescription, [[0, Translate["#clearValue#"]], [1, Translate["#setDate#"]]], DateHandler, [parameterValue, control, parameterDescription]);
			}
			if (typeDescription == "Boolean") {  //----------Boolean--------
				Dialogs.ChooseBool(parameterValue, "Value", Variables[control], null, parameterDescription);
			}
			if (typeDescription == "Snapshot") { //----------Snapshot-------
				query = new Query("SELECT Value FROM Catalog_Outlet_Parameters WHERE Parameter = @parameter AND Ref = @outlet")
				query.AddParameter("parameter", parameter);
				query.AddParameter("outlet", outlet);
				var snapshotId = query.ExecuteScalar();
				var snapshotIdIsEmpty = snapshotId == null || String.IsNullOrWhiteSpace(snapshotId);
				var source = (!snapshotIdIsEmpty ? Variables[("parameterImage"+index)].Source : null);
				Images.AddSnapshot(outlet, parameterValue, SaveAtOutelt, parameterDescription, source);
				parameterValueC = parameterValue;
			}
			if (typeDescription == "String" || typeDescription == "Integer" || typeDescription == "Decimal") {
				FocusOnEditText(control, '1');
			}
		}
	}
	if ($.Exists("parameterImage"+index)){
		if (typeDescription == "Snapshot" && (parseInt(editable)==parseInt(0) || !$.sessionConst.editOutletParameters)){
			Workflow.Action("ShowImage", [Variables[("parameterImage"+index)].Source, parameter, "Value", true])
		}
	}
}
function SetDateplan(DatePlan){
	var header = Translate["#enterDateTime#"];
		Dialog.DateTime(header, DatePlan, SetDateNow, DatePlan);
}
function SetDateNow(state, args) {
	$.PlanDate.Text = filterDate(args.Result);
	if (filterDate(args.Result) != filterDate(state) && DateTime.Parse(args.Result) > DateTime.Parse(state)) {
		Dialog.Ask("При изменении плановой даты, мероприятия будет завершенно. Продолжить?",OverVisAndCreatePLan,[state,args.Result],BackPLanDate,state);
	}
	if (DateTime.Parse(args.Result) < DateTime.Parse(state)){
		$.PlanDate.Text = filterDate(state);
		Dialog.Message("Невозможно перенести плановое мероприятие на прошедшие время");
	}
}
function OverVisAndCreatePLan(state, args) {
	newPicture = DB.Create("Document.ChangeDateInPlan");
	newPicture.Date = DateTime.Now;
	newPicture.sr = $.common.UserRef;
	newPicture.Outl = OutNow;
	newPicture.OldDate = state[0];
	newPicture.NewDate = state[1];
	newPicture.PV = Variables["planVisit"];
	newPicture.Save(false);
	Workflow.Rollback();
}
function BackPLanDate(state, args) {
  $.PlanDate.Text = filterDate(state);
}

function filterDate(dt){
	if (dt != null){
		return String.Format("{0:dd MMMM yyyy H:mm:ss}", DateTime.Parse(dt));
	} else {
		return "";
	}
}
function ShowBool(Merop){
	//Dialog.Message($.ChkBox.Checked);
	var checed = $.ChkBox.Checked;
	$.ChkBox.Checked = !checed;
	var meropObj = Merop.GetObject();
	meropObj.WithRuk = !checed;
	meropObj.Save();
}
function GetStatusDescription(outlet) {
	var query = new Query("SELECT Description FROM Enum_OutletStatus WHERE Id = @status");
	query.AddParameter("status", outlet.OutletStatus);
	queryResult = query.ExecuteScalar();
	result = Translate[String.Format("#{0}#", queryResult)]
	return result;
}

function FocusIfHasEditText(fieldName, editOutletParameters, primaryParameterName) {
	if (editOutletParameters && $.primaryParametersSettings[primaryParameterName] && DateAddTru == false) {
		FocusOnEditText(fieldName, 1);
	}
}

function ShowGoalContains(){
	Workflow.Action("ShowGoalContains", [])
}

function DateHandler(state, args) {
	var parameterValue = state[0];
	var control = state[1];
	if(getType(args.Result)=="System.DateTime"){
		parameterValue = parameterValue.GetObject();
		parameterValue.Value = Format("{0:dd.MM.yyyy HH:mm}", Date(args.Result));
		parameterValue.Save();
		Workflow.Refresh([]);
	}
	if (parseInt(args.Result)==parseInt(0)){
		parameterValue = parameterValue.GetObject();
		parameterValue.Value = "";
		parameterValue.Save();
		Workflow.Refresh([]);
	}
	if (parseInt(args.Result)==parseInt(1)){
		var parameterDescription = state[2];
		Dialogs.ChooseDateTime(parameterValue, "Value", Variables[control], DateHandler, parameterDescription);
	}
}

function GetSnapshots(outlet) {

	var q = new Query("SELECT S.Id AS Id, " +
										"CASE WHEN TRIM(IFNULL(OFILES.FullFileName, '')) != '' THEN LOWER(OFILES.FullFileName) ELSE '/shared/result.jpg' END AS FullFileName, " +
										"S.FileName AS FileName, " +
										"S.LineNumber AS LineNumber " +
										"FROM Catalog_Outlet_Snapshots S " +
										"LEFT JOIN Catalog_Outlet_Files OFILES ON S.FileName = OFILES.FileName AND OFILES.Ref = @ref " +
										"WHERE S.Ref=@ref AND (S.Deleted!='1' OR S.Deleted IS NULL) ORDER BY S.LineNumber");

	q.AddParameter("ref", outlet);

	snapshotsExists = true;

	countOfFiles = q.ExecuteCount();

	if (parseInt(countOfFiles)==parseInt(0)) {

		snapshotsExists = false;

	}

	singlePicture = false;

	if (parseInt(countOfFiles)==parseInt(1)) {

		singlePicture = true;

	}

	return q.Execute();

}

function NoSnapshots() {
	if (snapshotsExists)
		return false;
	else
		return true;
}

function GetImagePath(objectID, pictID, pictExt) {
	return Images.FindImage(objectID, pictID, pictExt, "Catalog_Outlet_Files");
}

function ImageActions(control, valueRef, imageControl, outlet, filename) {
	if ($.sessionConst.editOutletParameters && $.primaryParametersSettings["000000008"] && DateAddTru == false) {
		parameterValueC = valueRef;
		Images.AddSnapshot($.workflow.outlet, valueRef, OutletSnapshotHandler, Translate["#snapshot#"], Variables[imageControl].Source);
	} else {
		Workflow.Action("ShowImage", [GetImagePath(outlet, filename, ".jpg"), valueRef, "Value", true])
	}

}

function AddSnapshot(control, outlet) {
		parameterValueC = null;
		Images.AddSnapshot(outlet, null, OutletSnapshotHandler, Translate["#outletSnapshots#"], null);
}

function OutletSnapshotHandler(state, args) {
	if (args.Result){
		var outlet = state[0];
		var fileName = state[1];
		var fullFileName = state[2];
		var newPicture;

		if (String.IsNullOrEmpty(parameterValueC))
			newPicture = DB.Create("Catalog.Outlet_Snapshots");
		else
			newPicture = parameterValueC.GetObject();
		newPicture.Ref = outlet;
		newPicture.FileName = fileName;
		newPicture.Save();

		newFile = DB.Create("Catalog.Outlet_Files");
		newFile.Ref = outlet;
		newFile.FileName = fileName;
		newFile.FullFileName = fullFileName;
		newFile.Save();

		Workflow.Refresh([]);
	}
}

// --------------------------case Visits----------------------
function SetGoalToMerop(input,Merop){
	//Dialog.Message(Merop);
	var MeropObj = Merop.GetObject();
	MeropObj.Description = $.Goal.Text;
	MeropObj.Save();
}

function CreateVisitIfNotExists(userRef, visit, planVisit) {
//	Dialog.Message($.MeropCur);
	if (visit == null) {
		visit = DB.Create("Document.Visit");
		//Dialog.Message(planVisit);
		var meropFact = DB.Create("Catalog.Meropriyat");
		meropFact.Description = $.MeropCur.Description;
		if (planVisit != null && planVisit!=""){
			meropFact.DateStart = $.MeropCur.DateStart;
			meropFact.DateEnd = $.MeropCur.DateEnd;
		}else {
			meropFact.DateStart = DateTime.Now;
			meropFact.DateEnd = DateTime.Now;
		}
		meropFact.GoalContains = $.MeropCur.GoalContains;
		meropFact.MayBeDeal = $.MeropCur.MayBeDeal;
		meropFact.ContactPerson = $.MeropCur.ContactPerson;
		meropFact.TypeMeropr = $.MeropCur.TypeMeropr;
		meropFact.DO = $.workflow.outlet;
		if ($.MeropCur.WithRuk == null) {
				meropFact.WithRuk = 0;
		}else {
			meropFact.WithRuk = $.MeropCur.WithRuk;
		}
		meropFact.Save();
		if (planVisit != null && planVisit!=""){
			visit.Plan = planVisit;
			visit.PlanMerop = $.MeropCur;
		}
		visit.FactMerop = meropFact.Id;
		var existorno = new Query("Select type From sqlite_master where name = 'UT_answerQuest' And type = 'table'");
		var exorno = existorno.ExecuteCount();
		visit.Outlet = $.workflow.outlet;
		visit.SR = userRef;
		visit.Date = DateTime.Now;
		if (exorno > 0) {
			var checkansquest = new Query("Select id From UT_answerQuest");
			var counnurows = checkansquest.ExecuteCount();
			if (counnurows>0) {
				var datereq = new Query("Select DateStart From UT_answerQuest");
				var datestart = datereq.ExecuteScalar();
				visit.StartTime = datestart;
			}
			else {
				visit.StartTime = DateTime.Now;
			}
		}
		else {
			visit.StartTime = DateTime.Now;
		}
//		visit.StartTime = DateTime.Now;
		if (exorno > 0) {
			var checkansquest = new Query("Select id From UT_answerQuest");
			var counnurows = checkansquest.ExecuteCount();
			if (counnurows>0) {
				var refq = new Query("Select id From UT_answerQuest");
				var oldrefnumber = refq.ExecuteScalar();
				var oldRef = "@ref[Document_Visit]:" + oldrefnumber;
				//Dialog.Message(oldRef);
				visit.Id = oldRef;
				var Lattitudequ = new Query("Select Lattitude From UT_answerQuest");
				var Lattitudeold = Lattitudequ.ExecuteScalar();
				var Longitudequ = new Query("Select Longitude From UT_answerQuest");
				var Longitudeold = Longitudequ.ExecuteScalar();
				if (Lattitudeold!="" && Longitudeold!="") {
					visit.Lattitude = Lattitudeold;
					visit.Longitude = Longitudeold;
				}
			}
			else {
				var location = GPS.CurrentLocation;
				if (ActualLocation(location)) {
					visit.Lattitude = location.Latitude;
					visit.Longitude = location.Longitude;
				}
			}
		}else {
			var location = GPS.CurrentLocation;
			if (ActualLocation(location)) {
				visit.Lattitude = location.Latitude;
				visit.Longitude = location.Longitude;
			}
		}
		visit.Status = DB.Current.Constant.VisitStatus.Processing;

		visit.Encashment = 0;
		visit.Save();
		if (exorno > 0) {
			var checkansquest = new Query("Select id From UT_answerQuest");
			var counnurows = checkansquest.ExecuteCount();
			if (counnurows>0) {
					var answeredquest = new Query("Select question As quest, answer AS ans From UT_answerQuest");
					var param = answeredquest.Execute();
					while (param.Next()) {
						if (param.quest.AnswerType == DB.Current.Constant.DataType.Snapshot) {
							var snapshotold = DB.Create("Document.Visit_Files");
							snapshotold.Ref = visit.Id;
							snapshotold.FullFileName = "/private/document.visit/"+Right(ToString(visit.Id),36)+"/"+param.ans+".jpg";
							snapshotold.FileName = param.ans;
							snapshotold.Save();
						}
						var upd = new Query("UPDATE USR_Questions SET Answer='" + param.ans + "' WHERE Question=@question");
						upd.AddParameter("question",param.quest);
						upd.Execute();
					}
			}
		}

		return visit.Id;
	}

	return visit;
}

// -----------------------------------Coordinates--------------------------------

function SetLocation(control, outlet) {
	var location = GPS.CurrentLocation;
	if (ActualLocation(location)) {
		outlet = outlet.GetObject();
		outlet.Lattitude = location.Latitude;
		outlet.Longitude = location.Longitude;
		outlet.Save();
		Workflow.Refresh([]);
	} else
		NoLocationHandler(SetLocation, outlet);
}

function CoordsChecked(visit) {

	var location = GPS.CurrentLocation;
	if (ActualLocation(location) && DateAddTru == false) {
		var visitObj = visit.GetObject();
		visitObj.Lattitude = location.Latitude;
		visitObj.Longitude = location.Longitude;
		visitObj.Save();
	}

	if (Variables["workflow"]["name"] == "Visit" && NotEmptyRef(visit.Plan)) {
		var query = new Query("SELECT LogicValue FROM Catalog_MobileApplicationSettings WHERE Description='CoordinateControlEnabled'");
		var coordControl = query.ExecuteScalar();
		if (coordControl == null)
			var s = false;
		else {
			if (parseInt(coordControl) == parseInt(1))
				var s = true;
			else
				var s = false;
		}
		if (s && visit.Lattitude == null && visit.Longitude == null && DateAddTru == false) {
			Dialog.Question(Translate["#impossibleToCreateVisit#"], VisitCoordsHandler, visit);
			return false;
		}
	}
	return true;
}

function VisitCoordsHandler(answ, visit) {
	visit = $.workflow.visit;
	if (answ == DialogResult.Yes) {
		var location = GPS.CurrentLocation;
		if (ActualLocation(location)) {
			visit = visit.GetObject();
			visit.Lattitude = location.Latitude;
			visit.Longitude = location.Longitude;
			visit.Save();
			Dialog.Message("#coordinatesAreSet#");
		} else
			NoLocationHandler(SetLocation);
	}
}

function NoLocationHandler(descriptor) {
	Dialog.Message("#locationSetFailed#");
}

function ShowCoordOptions(control, outlet, editOutletParameters) {
	if (editOutletParameters && $.primaryParametersSettings["000000003"] && DateAddTru == false) {
		Dialog.Choose("#coordinates#", [[0,Translate["#clear_coord#"]], [1,Translate["#refresh#"]], [2,Translate["#copy#"]]], ChooseHandler, outlet);
	}
}

function ChooseHandler(state, args) {
	var outlet = state;
	if (parseInt(args.Result)==parseInt(0)){
		outlet = outlet.GetObject();
		outlet.Lattitude = parseInt(0);
		outlet.Longitude = parseInt(0);
		outlet.Save();
		Workflow.Refresh([]);
	}
	if (parseInt(args.Result)==parseInt(1)){
		SetLocation(null, outlet);
	}
	if (parseInt(args.Result)==parseInt(2)){
		Clipboard.SetString(outlet.Lattitude + "; " + outlet.Longitude);
	}
}

//---------------------------------Contractors--------------------------

function ShowContractorsIfExists(outlet) {

	if (outlet == null) {
		var existorno = new Query("Select type From sqlite_master where name = 'UT_answerQuest' And type = 'table'");
		var exorno = existorno.ExecuteCount();
		if (exorno > 0) {
			var checkansquest = new Query("Select outlet From UT_answerQuest");
			var outletref = checkansquest.ExecuteScalar();
		}
	}else {
		outletref = outlet;
	}
	var con = parseInt(HasContractors1(outletref));


		var outletObj = outletref.GetObject();

		var contractor;

		DoAction('Contractor', outletObj, true);

}

function HasContractors1(outlet){

	var res;

	var outletObj = outlet.GetObject();
	if (outletObj.Distributor==DB.EmptyRef("Catalog_Distributor"))
		res = HasOutletContractors(outlet);
	else
		res = HasPartnerContractors(outlet);

	return res;
}

function HasOutletContractors(outlet) {
	var q = new Query("SELECT COUNT(Id) FROM Catalog_Outlet_Contractors WHERE ref = @outlet")
	q.AddParameter("outlet", outlet);
	return q.ExecuteScalar();
}

function HasPartnerContractors(outlet){
	var outletObj = outlet.GetObject();
	var q = new Query("SELECT COUNT(Id) FROM Catalog_Distributor_Contractors C WHERE C.Ref=@distr");
	q.AddParameter("distr", outletObj.Distributor);
	return q.ExecuteScalar();
}

// --------------------------- Outlets ---------------------------

function Back(outlet) {
	if (CheckEmptyOutletFields(outlet)) {
		outlet.GetObject().Save();

		Variables.Remove("outlet");
		DoBackTo("List");
	}
}

function DeleteAndRollback(visit) {
	DB.Delete(visit);
	DoRollback();
}

function DoRollbackAction(visit){
	var existorno = new Query("Select type From sqlite_master where name = 'UT_answerQuest' And type = 'table'");
	var exorno = existorno.ExecuteCount();
	if (exorno > 0) {
		DB.TruncateTable("answerQuest");
	}
	if (visit!=null) {
		var FileInVis = new Query("SELECT FullFileName From Document_Visit_Files WHERE Ref = @ref");
		FileInVis.AddParameter("ref",visit);
		var VisitFile = FileInVis.Execute();
		while (VisitFile.Next()) {
			//Dialog.Message("DELET");
			FileSystem.Delete(VisitFile.FullFileName);
		}
	}
	DoRollback();
}
function SaveAndBack(outlet) {
	GlobalWorkflow.SetDateAdd(false);
	if (CheckEmptyOutletFields(outlet)) {
		outlet.GetObject().Save();
		ReviseParameters(outlet, true);
		if ($.Exists("outlet"))
			$.Remove("outlet");
		Workflow.Commit();
	}
}

// ---------------------------------internal------------------------

function SaveAtOutelt(arr, args) {
	if (args.Result) {
		var paramValue = parameterValueC;
		var path = arr[1];
		var question = paramValue.GetObject();
		question.Value = path;
		question.Save();

		newFile = DB.Create("Catalog.Outlet_Files");
		newFile.Ref = arr[0];
		newFile.FileName = arr[1];
		newFile.FullFileName = arr[2];
		newFile.Save();

		Workflow.Refresh([]);
	}
}

function CheckEmptyOutletFields(outlet) {
	var correctAddr = CheckIfEmpty(outlet, "Address", "", "", false);
	if (correctAddr) {
		return true;
	}else {
		outletobj = outlet.GetObject();
		outletobj.Address = "адрес";
	}
	return true;
}

function CheckIfEmpty(entity, attribute, objectType, objectName, deleteIfEmpty) {

	if (entity[attribute].Trim() == "" || String(entity[attribute]) == "0") {
		if (entity.IsNew() && ConvertToBoolean(deleteIfEmpty)) {
			DB.Current[objectType][objectName].Delete(entity);
			return true;
		} else
			return false;
	} else
		return true;
}

function BackMenu(){
	if (GlobalWorkflow.GetMenuItem() == "Outlets")
		return false;
	else
		return true;
}

function SnapshotExists(filename) {

	return FileSystem.Exists(filename);

}
