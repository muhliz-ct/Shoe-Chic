const order = require('../models/orderModel');





const loadReport = async(req,res)=>{
    try {

        const reportValue = req.params.id;
        
        if(reportValue == 'Week'){
            const currentDate = new Date(Date.now());
            const weekStart = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() - currentDate.getDay()
            );

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate()+7);

            const report = await order.find({dateOfOrder:{$gte:weekStart , $lte:weekEnd}});

            res.render('salesReport',{report, data: "Week", reportVal: req.params.id})

        }else if(reportValue == 'Month'){

            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const startDate = new Date(currentDate.getFullYear(), currentMonth);
            const endDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);

            const report = await order.find({dateOfOrder : { $gte: startDate, $lte: endDate } });

            console.log(report);

            res.render("salesReport", { report, data: "Month", reportVal: req.params.id, });

        }else if(reportValue == 'Year'){
            const currentDate = new Date();
            const yearStart = new Date(currentDate.getFullYear(), 0, 1);
            const yearEnd = new Date(currentDate.getFullYear() + 1, 0, 0);

            const report = await order.find({

                dateOfOrder: { $gte: yearStart, $lte: yearEnd },

            });

            res.render("salesReport", { report, data: "Year", reportVal: req.params.id });
        }else if(reportValue == 'Custom'){
            res.render("salesReport", {

                custom: true,
                reportVal: req.params.id,
                data: "costum",

            });

        } else {

            res.redirect("/admin");
        }
        
        
    } catch (error) {
        console.error(error.message)
    }
}

const customReport = async(req,res)=>{
    try {
        const startDate = req.body.start;
        let endDate = req.body.end ;

        dateObj = new Date(endDate);

        dateObj.setUTCHours(23);
        dateObj.setUTCMinutes(59);
        dateObj.setUTCSeconds(59);
        dateObj.toISOString();

        console.log(startDate , endDate);

        const getData = await order.find({dateOfOrder:{$gte:startDate , $lte:dateObj } , orderStatus:'delivered'});

        console.log(getData);

        console.log(getData);

        res.send({ getData });
    } catch (error) {
        console.error(error.message)
    }
}








module.exports = {
    loadReport,
    customReport
}