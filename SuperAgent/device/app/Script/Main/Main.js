﻿// ------------------------ Main screen module ------------------------

function CloseMenu() {
    var sl = Variables["swipe_layout"];
    if (sl.Index == 1) {
        sl.Index = 0;
    }
    else if (sl.Index == 0) {
        sl.Index = 1;
    }
}

function OpenMenu() {
    var sl = Variables["swipe_layout"];
    if (sl.Index == 1) {
        sl.Index = 0;
    }
    else if (sl.Index == 0) {
        sl.Index = 1;
    }
}

function Fake() {

}

function MakeSnapshot() {
    GetCameraObject();
    Camera.MakeSnapshot();
}

function GetCameraObject() {
    FileSystem.CreateDirectory("/private/Document.Visit");
    Camera.Size = 300;
    Camera.Path = "/private/Document.Visit/1.jpg";
}

// --------------------------------------------------------------------------------

function GetScheduledVisitsCount() {
    var q = new Query("SELECT COUNT(*) FROM Document_VisitPlan_Outlets WHERE Date=@date");
    q.AddParameter("date", DateTime.Now.Date);
    var cnt = q.ExecuteScalar();
    if (cnt == null)
        return 0;
    else
        return cnt;
}

function GetOutletsQty() {    
    var q = new Query("SELECT COUNT(*) FROM Catalog_Territory_Outlets");
    var cnt = q.ExecuteScalar();
    if (cnt == null)
        return 0;
    else
        return cnt;
}

function GetOutletsCount() {
    var q = new Query("SELECT COUNT(*) FROM Catalog_Outlet");
    var cnt = q.ExecuteScalar();
    if (cnt == null)
        return 0;
    else
        return cnt;
}

function GetCommitedScheduledVisits() {
    var q = new Query("SELECT DISTINCT VP.Outlet FROM Document_Visit V JOIN Document_VisitPlan_Outlets VP ON VP.Outlet=V.Outlet JOIN Catalog_Outlet O ON O.Id = VP.Outlet WHERE V.Date >= @today AND V.Date < @tomorrow ORDER BY O.Description LIMIT 100");
    q.AddParameter("today", DateTime.Now.Date);
    q.AddParameter("tomorrow", DateTime.Now.Date.AddDays(1));    
    var cnt = q.ExecuteCount();
    if (cnt == null)
        return 0;
    else
        return cnt;
}

function GetOrderSumm() {
    var q = new Query("SELECT SUM(S.Qty * S.Total) FROM Document_Order_SKUs S LEFT JOIN Document_Order O ON (O.Id = S.Ref) WHERE O.Date >= @today AND O.Date < @tomorrow");
    q.AddParameter("today", DateTime.Now.Date);
    q.AddParameter("tomorrow", DateTime.Now.Date.AddDays(1));
    var cnt = q.ExecuteScalar();
    if (cnt == null)
        return 0;
    else
        return cnt;
}

function GetEncashmentSumm() {
    var q = new Query("SELECT SUM(EncashmentAmount) FROM Document_Encashment WHERE Date >= @today AND Date < @tomorrow");
    q.AddParameter("today", DateTime.Now.Date);
    q.AddParameter("tomorrow", DateTime.Now.Date.AddDays(1));
    var cnt = q.ExecuteScalar();
    if (cnt == null)
        return 0;
    else
        return cnt;
}

function GetReceivablesSumm() {
    var q = new Query("SELECT SUM(RD.DocumentSum) FROM Document_AccountReceivable_ReceivableDocuments RD JOIN Document_AccountReceivable AR ON AR.Id = RD.Ref WHERE AR.Date >= @today AND AR.Date < @tomorrow");
    q.AddParameter("today", DateTime.Now.Date);
    q.AddParameter("tomorrow", DateTime.Now.Date.AddDays(1));
    var cnt = q.ExecuteScalar();
    if (cnt == null)
        return 0;
    else
        return cnt;
}