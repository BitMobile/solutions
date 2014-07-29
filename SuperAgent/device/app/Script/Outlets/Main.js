function GetOutlets(searchText) {
	if (String.IsNullOrEmpty(searchText)) {
		var query = new Query();
		query.Text = "SELECT Id, Address, Description FROM Catalog_Outlet ORDER BY Description LIMIT 100";
		return query.Execute();
	} else {
		searchText = "'" + searchText + "'";
		var query = new Query("SELECT O.Id, T.Outlet, O.Description, O.Address FROM Catalog_Territory_Outlets T JOIN Catalog_Outlet O ON O.Id=T.Outlet WHERE Contains(O.Description, " + searchText + ") ORDER BY O.Description LIMIT 500");
		return query.Execute();
	}
}

function AddGlobalAndAction(name, value, actionName) {
	if (Variables.Exists(name))
		$.Remove(name);
	$.AddGlobal(name, value);
	Workflow.Action(actionName, []);
}

function CreateOutletAndForward() {
	var p = DB.Create("Catalog.Outlet");
	p.Lattitude = 0;
	p.Longitude = 0;

	var parameters = [ p ];
	Workflow.Action("Create", parameters);
}

function CreateVisitEnable() {
	if ($.sessionConst.PlanEnbl && $.workflow.name == "Outlets")
		return true;
	else
		return false;

}

function GetOutletParameters(outlet) {
	var query = new Query();
	query.Text = "SELECT P.Id, P.Description, P.DataType, DT.Description AS TypeDescription, OP.Id AS ParameterValue, OP.Value FROM Catalog_OutletParameter P JOIN Enum_DataType DT ON DT.Id=P.DataType LEFT JOIN Catalog_Outlet_Parameters OP ON OP.Parameter = P.Id AND OP.Ref = @outlet";
	query.AddParameter("outlet", outlet);
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

function CreateOutletParameterValue(outlet, parameter, value, parameterValue) {
	var q = new Query("SELECT Id FROM Catalog_Outlet_Parameters WHERE Ref=@ref AND Parameter = @parameter");
	q.AddParameter("ref", outlet);
	q.AddParameter("parameter", parameter);
	parameterValue = q.ExecuteScalar();
	Dialog.Debug(parameterValue);
	if (parameterValue == null) {
		parameterValue = DB.Create("Catalog.Outlet_Parameters");
		parameterValue.Ref = outlet;
		parameterValue.Parameter = parameter;
	} else
		parameterValue = parameterValue.GetObject();
	parameterValue.Value = value;
	parameterValue.Save();
	return parameterValue.Id;
}

function SaveValue(control, parameterValue, outlet, parameter) {
	if (parameterValue == null) {
		parameterValue = CreateOutletParameterValue(outlet, parameter);
		parameterValue.Value = control.Text;
	}
	// parameterValue = parameterValue.GetObject();
	parameterValue.Save();
}

function GetSnapshotText(text) {
	if (String.IsNullOrEmpty(text))
		return Translate["#noSnapshot#"];
	else
		return Translate["#snapshotAttached#"];
}

function SelectIfNotAVisit(outlet, attribute, entity) {
	if ($.workflow.name != "Visit")
		DoSelect(outlet, attribute, entity);
}

function GoToParameterAction(typeDescription, parameterValue, value, outlet, parameter, control) {

	parameterValue = CreateOutletParameterValue(outlet, parameter, Variables[control].Text, parameterValue);
	
	if (typeDescription == "ValueList") {
		var q = new Query();
		q.Text = "SELECT Value, Value FROM Catalog_OutletParameter_ValueList WHERE Ref=@ref";
		q.AddParameter("ref", parameter);
		ValueListSelect(parameterValue, "Value", q.Execute(), Variables[control]);
	}
	if (typeDescription == "DateTime") {
		DateTimeDialog(parameterValue, "Value", parameterValue.Value, Variables[control]);
	}
	if (typeDescription == "Boolean") {
		BooleanDialogSelect(parameterValue, "Value", Variables[control]);
	}
	if (typeDescription == "Snapshot") {
		var guid = GetCameraObject(outlet);
		Camera.MakeSnapshot(SaveAtOutelt, [ parameterValue, control, guid ]);
	}
//	if (typeDescription == "Integer" || typeDescription == "Decimal" || typeDescription == "String") {
//		CreateOutletParameterValue(outlet, parameter, control.Text, parameterValue)
//	}

}

function AssignParameterValue(control, typeDescription, parameterValue, value, outlet, parameter){
	CreateOutletParameterValue(outlet, parameter, control.Text, parameterValue)
}

function GetLookupList(entity, attribute) {
	var tableName = entity[attribute].Metadata().TableName;
	var query = new Query();
	query.Text = "SELECT Id, Description FROM " + tableName;
	return query.Execute();
}

function UpdateValueAndBack(entity, attribute, value) {
	if (attribute != "Answer" && attribute != "Value") { // for
		// Visit_Questions
		entity[attribute] = value;
		if (attribute == "PriceList") {
			var n = CountEntities("Document", "Order_SKUs", Variables["workflow"]["order"].Id, "Ref");
			if (parseInt(n) != parseInt(0))
				Dialog.Message("#SKUWillRevised#");
		}
	} else {
		entity[attribute] = value.Value;
	}

	Workflow.Back();
}

function CheckNotNullAndForward(outlet, visit) {
	var c = CoordsChecked(visit);
	if (CheckEmptyOutletFields(outlet) && c) {
		outlet.GetObject().Save();
		ReviseParameters(outlet, false);
		Workflow.Forward([]);
	}
}

function ReviseParameters(outlet, save) {
	var q = new Query("SELECT Id, Value FROM Catalog_Outlet_Parameters WHERE Ref=@ref");
	q.AddParameter("ref", outlet);
	var param = q.Execute();

	while (param.Next()) {
		if (String.IsNullOrEmpty(param.Value))
			DB.Delete(param.Id);
		else {
			if (save)
				param.Id.GetObject().Save(false);
		}
	}
}

function CreateOutlet() {
	var outlet = DB.Create("Catalog.Outlet");
	outlet.OutletStatus = DB.Current.Constant.OutletStatus.Potential;
	outlet.Save();
	return outlet.Id;
}

// --------------------------case Visits----------------------

function CreateVisitIfNotExists(outlet, userRef, visit, planVisit) {

	if (visit == null) {
		visit = DB.Create("Document.Visit");
		if (planVisit != null)
			visit.Plan = planVisit;
		visit.Outlet = outlet;
		visit.SR = userRef;
		visit.Date = DateTime.Now;
		visit.StartTime = DateTime.Now;
		var location = GPS.CurrentLocation;
		if (location.NotEmpty) {
			visit.Lattitude = location.Latitude;
			visit.Longitude = location.Longitude;
		}
		visit.Status = DB.Current.Constant.VisitStatus.Processing;

		visit.Encashment = 0;
		visit.Save();
		return visit.Id;
	}

	return visit;
}

// -----------------------------------Coodinates--------------------------------

function SetLocation(outlet) {
	Dialog.Question("#setCoordinates#", LocationDialogHandler, outlet);
}

function LocationDialogHandler(answ, outlet) {
	if (answ == DialogResult.Yes) {
		var location = GPS.CurrentLocation;
		if (location.NotEmpty) {
			outlet = outlet.GetObject();
			outlet.Lattitude = location.Latitude;
			outlet.Longitude = location.Longitude;
			Dialog.Message("#coordinatesAreSet#");
			// var outlet = $.outlet;
			outlet.Save();
			Variables["outletCoord"].Text = (outlet.Lattitude + ", " + outlet.Longitude);
		} else
			NoLocationHandler(LocationDialogHandler);
	}
}

function CoordsChecked(visit) {
	if (Variables["workflow"]["name"] == "Visit" && NotEmptyRef(visit.Plan)) {
		var query = new Query("SELECT Use FROM Catalog_MobileApplicationSettings WHERE Code='CoordCtrl'");
		var coordControl = query.ExecuteScalar();
		if (coordControl == null)
			var s = false;
		else {
			if (parseInt(coordControl) == parseInt(1))
				var s = true;
			else
				var s = false;
		}
		if (s && visit.Lattitude == null && visit.Longitude == null) {
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
		if (location.NotEmpty) {
			visit = visit.GetObject();
			visit.Lattitude = location.Latitude;
			visit.Longitude = location.Longitude;
			visit.Save();
			Dialog.Message("#coordinatesAreSet#");
		} else
			NoLocationHandler(VisitCoordsHandler);
	}
}

function NoLocationHandler(descriptor) {
	Dialog.Question("#locationSetFailed#", descriptor);
}

// --------------------------- Outlets ---------------------------

function DiscardNewOutlet(outlet) {
	DB.Delete(outlet);
	DoBack();
}

function SaveNewOutlet(outlet) {

	if ($.outletName.Text.Trim() != "" && $.outletAddress.Text.Trim() != "" && $.outletClass.Text.Trim() != "" && $.outletType.Text.Trim() != "" && $.outletDistr.Text.Trim() != "") {
		var q = new Query("SELECT Id FROM Catalog_Territory WHERE SR = @userRef LIMIT 1");
		q.AddParameter("userRef", $.common.UserRef);
		var territory = q.ExecuteScalar();

		var to = DB.Create("Catalog.Territory_Outlets");
		to.Ref = territory;
		to.Outlet = outlet;
		to.Save();

		outlet.GetObject().Save();
		Variables.AddGlobal("outlet", outlet);

		DoAction("Open");
	} else {
		Dialog.Message("#messageNulls#");
	}
}

function Back(outlet) {
	if (CheckEmptyOutletFields(outlet)) {
		outlet.GetObject().Save();

		Variables.Remove("outlet");
		DoBackTo("List");
	}
}

function DeleteAndBack(entity) {
	DB.Delete(entity);
	Workflow.Back();
}

function DeleteAndRollback(visit) {
	DB.Delete(visit);
	DoRollback();
}

function SaveAndBack(outlet) {
	if (CheckEmptyOutletFields(outlet)) {
		outlet.GetObject().Save();
		ReviseParameters(outlet, true);
		if ($.Exists("outlet"))
			$.Remove("outlet");
		// DB.Commit();
		Workflow.BackTo("Outlets");
	}
}

// ---------------------------------internal------------------------

function SaveAtOutelt(arr) {
	var paramValue = arr[0];
	var control = arr[1];
	var path = arr[2];
	question = paramValue.GetObject();
	question.Value = path;
	question.Save();
	Variables[control].Text = Translate["#snapshotAttached#"];

}

function GetCameraObject(entity) {
	FileSystem.CreateDirectory("/private/Catalog.Outlet");
	var guid = Global.GenerateGuid();
	// Variables.Add("guid", guid);
	var path = String.Format("/private/Catalog.Outlet/{0}/{1}.jpg", entity.Id, guid);
	Camera.Size = 300;
	Camera.Path = path;
	return guid;
}

function CheckEmptyOutletFields(outlet) {
	var correctAddr = CheckIfEmpty(outlet, "Address", "", "", false);
	if (correctAddr) {
		return true;
	}
	Dialog.Message("#couldnt_be_cleaned#");
	return false;
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

// ------------------------------internal-----------------------------------

function DialogCallBack(control, key) {
	control.Text = key;
}