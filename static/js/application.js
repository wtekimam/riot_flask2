$(document).ready(function () {
	console.log("Hello, world");
    //connect to the socket server.
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
    var user = "William";
    var lastTransaction = {"Coke": 1, "Sprite": 0};
    var temperature = 27;
    var humidity = 60;
    var doorStatus = "Op";
    var itemList = {"Coke": 1, "Sprite": 0};

    //receive details from server
    socket.on('temperature_read', function (msg) {
        console.log("humidity: " + msg.humidity + "temperature: " + msg.temperature + msg.door_status);

        temperatureString = "<p>humidity: " + msg.humidity +
            "</p><p>temperature: " + msg.temperature + "</p>";
        temperatureString += "<p>Door is " + msg.door_status + "</p>";

        $('#log').html(temperatureString);

	user = msg.role;
	    temperature = msg.temperature;
	    humidity = msg.humidity;
	    doorStatus = msg.door_status;
	    itemList = msg.item_list;

    $('#welcome').html("<p>Welcome, " + user + "!</p>");
    $('#last_transaction').html("<p>Last Transaction: <br>"
        + "Coke: " + lastTransaction.Coke + "<br>"
        + "Sprite: " + lastTransaction.Sprite + "</p>"
    );

    $('#temperature').html("<p>Temperature<br>" + temperature + "</p>");

    $('#humidity').html("<p>Humidity<br>" + humidity + "%</p>");

    $('#door_status').html("<p>Door is<br>" + doorStatus + "</p>");

    $('#item_list').html("<p>Item List: <br>"
        + "Coke: " + itemList.Coke + "<br>"
        + "Sprite: " + itemList.Sprite + "</p>"
    );
    });


});
