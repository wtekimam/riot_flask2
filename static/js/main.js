// Debug Content
let Debug_Text = $('#txtdebug');

function debuglog(message) {
    Debug_Text.text("Debug: " + message);
}

// Character Content
const Character = $('.character');
const CharacterBubbleStick = $('.character-bubble--stick');
const CharacterBubbleStick_Text = $('#txtCharacter_Bubble');

var transactions = [
    {
        id: '0001',
        coke: 0,
        sprite: 0,
    },
]

var countdownConfirmationScreen; //to stop countdown on confirmation screen

var characterPositionTop = '325';
var characterPositionLeft = '1095';

var name = "John";
var humidity = "80";
var temperature = "23";

var takeCoke = 2;
var takeSprite = 1;

var prevCoke = 0;
var prevSprite = 0;
var curCoke = 0;
var curSprite = 0;

$(document).ready(function () {
    MainScreen.show();
    MainScreen_Warning.hide();
    TutorialScreen.hide();
    CorrectionScreen.hide();
    ConfirmationScreen.hide();
    SupplierScreen.hide();

    // for test purposes
    // Character.hide();
    // MainScreen.hide();
    // TutorialScreen.show();
    // ConfirmationScreen.show();
    // confirm();
    // SupplierScreen.show();
    // CorrectionScreen.show();

    // showSupplierScreen(MainScreen);
    // showConfirmationScreen(MainScreen);
    // showCorrectionScreen(MainScreen);

    console.log("Hello, world");
    //connect to the socket server.
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');

    //receive details from server
    socket.on('temperature_read', function (msg) {
        
        //console.log("humidity: " + msg.humidity + " temperature: " + msg.temperature
        //	+ " door: " + msg.door_status + " finish: " + msg.finish + " tap " + msg.card_tap);

        temperatureString = "<p>humidity: " + msg.humidity +
            "</p><p>temperature: " + msg.temperature + "</p>";
        temperatureString += "<p>Door is " + msg.door_status + "</p>";

        $('#log').html(temperatureString);


        name = msg.role;
        humidity = msg.humidity;
        temperature = msg.temperature;

        curCoke = msg.item_list.Coke;
        curSprite = msg.item_list.Sprite;


        if (curCoke === undefined) {
            curCoke = 0;
        }

        if (curSprite === undefined) {
            curSprite = 0;
        }
        if (prevCoke === undefined) {
            curCoke = 0;
        }

        if (prevSprite === undefined) {
            curSprite = 0;
        }

        if (msg.card_tap === true && msg.role !== "vendor") {
            debuglog("card tapped");
            showConfirmationScreen(MainScreen);
        }

        if (msg.finish === true) {
            if (prevCoke - curCoke < 0 || prevSprite - curSprite < 0) {
                takeCoke = -1;
                putCoke = prevCoke + curCoke;
                putSprite = prevCoke + curCoke;
            } else {
                takeCoke = prevCoke - curCoke;
                takeSprite = prevSprite - curSprite;
            }
            debuglog(takeSprite + " " + takeCoke);

            confirm();
            // charConfirm();
            // setTimeout(confirm, 5000);

            console.log("finish");
        }

        if (msg.role === "vendor") {
            showSupplierScreen(MainScreen);
            debuglog("Vendor")
        }

        // $('#go-back').click(showMainScreen());
        $('#tempe').text(temperature);
        $('#humi').text(humidity);
        $('#txtCorrectionTable_Coke').text(msg.curCoke);
        $('#txtCorrectionTable_Sprite').text(msg.curSprite);
    });
});

//#region Main Screen
// Main Screen Content
const MainScreen = $('#main-screen');
const MainScreen_TapCard = $('.main-screen-tapcard');
const MainScreen_Peek = $('.main-screen-peek');
const MainScreen_Warning = $('.main-screen-warning');
const MainScreenButton_Peek = $('#btnMain_Peek');
const MainScreenButton_Tutorial = $('#btnMain_Tutorial');

MainScreenButton_Peek.click(function () {
    $.post('/peek')
});

function showMainScreen(screen) {
    if (screen) {
        screen.fadeOut(1000);
        if (SupplierScreen) {
            Character.fadeIn(1000);
        }
        ;
    }
    ;
    clearInterval(countdownConfirmationScreen);

    MainScreen_Warning.hide();
    MainScreen_Peek.show();
    MainScreen.delay(1500).fadeIn(1000);

    CharacterBubbleStick
        .fadeOut(1100) //fadeout to change text
        .delay(2500)
        .fadeIn(1100) //text: "dont forget to close.."
    ;

    setTimeout(function () {
        CharacterBubbleStick_Text.text("Hello there");
    }, 1000); //run after text fadeout

    Character.animate({
        top: characterPositionTop,
        left: characterPositionLeft
    }, 1500);
}

$('#btnMain_Tap').click(function () {
    showConfirmationScreen(MainScreen);
});

$('#btnMain_Supplier').click(function () {
    showSupplierScreen(MainScreen);
});

MainScreenButton_Tutorial.click(function () {
    showTutorialScreen(MainScreen);
});

//#endregion

//#region Tutorial Screen
// Tutorial Screen Content
const TutorialScreen = $('#tutorial-screen');
const TutorialScreen_Tutorial1 = $('.tutorial-screen-tutorial1');
const TutorialScreen_Tutorial2 = $('.tutorial-screen-tutorial2');
const TutorialScreen_Tutorial3 = $('.tutorial-screen-tutorial3');
const TutorialScreen_Tutorial4 = $('.tutorial-screen-tutorial4');

function showTutorialScreen(screen) {
    if (screen) {
        screen.fadeOut(1000);
    }

    characterTutorialAnimation();

    TutorialScreen.delay(1000).fadeIn(1000);

    TutorialScreen_Tutorial1.fadeOut(500).delay(1000).fadeIn(1000);
    TutorialScreen_Tutorial2.fadeOut(500).delay(4000).fadeIn(1000);
    TutorialScreen_Tutorial3.fadeOut(500).delay(7000).fadeIn(1000);
    TutorialScreen_Tutorial4.fadeOut(500).delay(9000).fadeIn(1000);

    setTimeout(function () {
        showMainScreen(TutorialScreen);
    }, 12000);
}

function characterTutorialAnimation() {
    CharacterBubbleStick.fadeOut(1000);

    Character
        .animate({
            top: '30',
            left: '10'
        }, 1500)
        .delay(1500)
        .animate({
            top: '30',
            left: '1300'
        }, 1500)
        .delay(1500)
        .animate({
            top: '270',
            left: '300'
        }, 1500)
        .delay(1000)
        .animate({
            top: '430',
            left: '170'
        }, 1000)
        .delay(3000)
    ;
}

//#endregion

//#region Confirmation Screen
// Confirmation Screen Content
const ConfirmationScreen = $('#confirmation-screen');
const ConfirmationButton_Yes = $('#btnConfirmation_Yes');
const ConfirmationButton_No = $('#btnConfirmation_No');

function showConfirmationScreen(screen) {
    if (screen) {
        screen.fadeOut(800);
    }

    characterConfirmationAnimation();

    // setTimeout(function () {
    //     confirm();
    // }, 5000); //run after text fadeout

}

ConfirmationButton_Yes.click(function () {
    editProductQty(products.coke - takeCoke, products.sprite - takeSprite);
    saveTransaction();
    ConfirmationButton_Yes.text("Yes");
    showMainScreen(ConfirmationScreen);
});
ConfirmationButton_No.click(function () {
    ConfirmationButton_Yes.text("Yes");
    showCorrectionScreen(ConfirmationScreen);
});

function confirm() {
    var itemTaken = "Hey " + name + ", ";
    // takeCoke = 2;
    // takeSprite = 1;

    if (takeSprite > 0 && takeCoke > 0) {
        itemTaken += "did you take " + takeCoke + " Coke and " + takeSprite + " Sprite?"
    } else if (takeCoke > 0) {
        itemTaken += "did you take " + takeCoke + " Coke?"
    } else if (takeSprite > 0) {
        itemTaken += "did you take " + takeSprite + " Sprite?"
    } else if (takeSprite === 0 && takeCoke === 0) {
        itemTaken += "did you take nothing?"
    } else if (takeSprite === -1) {

    }

    CharacterBubbleStick_Text.text(itemTaken);

    setTimeout(function () {
        ConfirmationScreen.fadeIn(800);
        var timer = 5, seconds;
        countdownConfirmationScreen = setInterval(function () {
            seconds = parseInt(timer % 60, 10);
            seconds = seconds < 10 ? "0" + seconds : seconds;

            ConfirmationButton_Yes.text("Yes (" + seconds + ")");

            if (--timer < 0) {
                editProductQty(curCoke, curSprite);
                saveTransaction();
                ConfirmationButton_Yes.text("Yes");
                showMainScreen(ConfirmationScreen);
            }
        }, 1000);
    }, 1000);
}

function charConfirm() {

    $('#character-bubble--stick-text').text("Hey " + name + ", did you take "
        + takeCoke + " Coke and " + takeSprite + " Sprite?");

    prevCoke = curCoke;
    prevSprite = curSprite;
    ConfirmationScreen.fadeIn(1000);

}

function editProductQty(cokeQty, spriteQty) {
    products.coke = cokeQty;
    products.sprite = spriteQty;

    curCoke = products.coke;
    curSprite = products.sprite;

}

function saveTransaction() {
    var newTrans = {};
    var newId = parseInt(transactions[transactions.length - 1].id) + 1;
    debuglog(newId);
    newTrans.id = '000' + newId;
    newTrans.coke = takeCoke;
    newTrans.sprite = takeSprite;

    transactions.push(newTrans);
}

function characterConfirmationAnimation() {
    CharacterBubbleStick
        .fadeOut(500) //fadeout to change text
        .delay(500)
        .fadeIn(500) //text: "dont forget to close.."
    ;

    setTimeout(function () {
        CharacterBubbleStick_Text.text("Don't forget to close the door");
    }, 900); //run after text fadeout

    Character
        .animate({
            top: '450',
            left: '300'
        }, 1000)
        .delay(4000)
        .animate({
            top: '350',
            left: '300'
        }, 1000);
}

//#endregion

//#region Correction Screen
// Correction Screen Content
const CorrectionScreen = $('#correction-screen');
const CorrectionScreenButton_Confirm = $('#btnCorrection_Confirm');
const CorrectionScreenButton_Clear = $('#btnCorrection_Clear');
const CorrectionProduct_CokeRemove = $('#btnCorrectionProduct_CokeRemove');
const CorrectionProduct_CokeAdd = $('#btnCorrectionProduct_CokeAdd');
const CorrectionProduct_CokeQty = $('#txtCorrectionProduct_CokeQty');
const CorrectionProduct_SpriteRemove = $('#btnCorrectionProduct_SpriteRemove');
const CorrectionProduct_SpriteAdd = $('#btnCorrectionProduct_SpriteAdd');
const CorrectionProduct_SpriteQty = $('#txtCorrectionProduct_SpriteQty');

function showCorrectionScreen(screen) {
    if (screen) {
        screen.fadeOut(800);
    }
    clearInterval(countdownConfirmationScreen);

    takeCoke = 0;
    takeSprite = 0;
    CorrectionProduct_CokeQty.text(takeCoke);
    CorrectionProduct_SpriteQty.text(takeSprite);

    CharacterBubbleStick
        .fadeOut(800)
        .delay(300)
        .fadeIn(500)
    ;

    setTimeout(function () {
        CharacterBubbleStick_Text.text("Please tell us what you took");
    }, 1000); //run after text fadeout

    Character
        .animate({
            top: '280',
            left: '260'
        }, 1000)
    ;

    CorrectionScreen.delay(2000).fadeIn(1000);
}

CorrectionProduct_CokeRemove.click(function () {
    takeCoke -= 1;
    CorrectionProduct_CokeQty.text(takeCoke);
});
CorrectionProduct_CokeAdd.click(function () {
    takeCoke += 1;
    CorrectionProduct_CokeQty.text(takeCoke);
});

CorrectionProduct_SpriteRemove.click(function () {
    takeSprite -= 1;
    CorrectionProduct_SpriteQty.text(takeSprite);
});
CorrectionProduct_SpriteAdd.click(function () {
    takeSprite += 1;
    CorrectionProduct_SpriteQty.text(takeSprite);
});

CorrectionScreenButton_Confirm.click(function () {
    editProductQty(prevCoke - takeCoke, prevSprite - takeSprite);
    saveTransaction();
    showMainScreen(CorrectionScreen);
});
CorrectionScreenButton_Clear.click(function () {
    takeCoke = 0;
    takeSprite = 0;

    CorrectionProduct_CokeQty.text(takeCoke);
    CorrectionProduct_SpriteQty.text(takeSprite);
});

//#endregion

//#region Supplier Screen
// Supplier Screen Content
const SupplierScreen = $('#supplier-screen');
const SupplierScreenButton_Home = $('#btnSupplier_Home');

const SupplierProduct_CokeQty = $('#txtSupplierProduct_CokeQty');
const SupplierProduct_CokeAdd = $('#btnSupplierProduct_CokeAdd');
const SupplierProduct_CokeRemove = $('#btnSupplierProduct_CokeRemove');
const SupplierProduct_CokeEdit = $('#btnSupplierProduct_CokeEdit');
const SupplierProduct_CokeCancel = $('#btnSupplierProduct_CokeCancel');

const SupplierProduct_SpriteQty = $('#txtSupplierProduct_SpriteQty');
const SupplierProduct_SpriteAdd = $('#btnSupplierProduct_SpriteAdd');
const SupplierProduct_SpriteRemove = $('#btnSupplierProduct_SpriteRemove');
const SupplierProduct_SpriteEdit = $('#btnSupplierProduct_SpriteEdit');
const SupplierProduct_SpriteCancel = $('#btnSupplierProduct_SpriteCancel');

const SupplierTransaction_Table = $('#tblSupplierTransaction');

var products = {
    coke: curCoke,
    sprite: curSprite
};

function showSupplierScreen(screen) {
    if (screen) {
        screen.fadeOut(800);
    }

    takeCoke = 0;
    takeSprite = 0;
    SupplierProduct_CokeQty.text(products.coke);
    SupplierProduct_SpriteQty.text(products.sprite);

    SupplierProduct_CokeRemove.hide();
    SupplierProduct_CokeAdd.hide();
    SupplierProduct_CokeCancel.hide();
    SupplierProduct_SpriteRemove.hide();
    SupplierProduct_SpriteAdd.hide();
    SupplierProduct_SpriteCancel.hide();

    $('#tblSupplierTransaction tbody tr').remove();

    for (var i = 0; i < transactions.length; i++) {
        $('#tblSupplierTransaction > tbody:last-child')
            .append('<tr class="border-bottom"><td class="mdl-data-table__cell--non-numeric">' +
                transactions[i].id + '</td><td style="text-align:center;">' +
                transactions[i].coke + '</td><td style="text-align:center;">' +
                transactions[i].sprite + '</td></tr>'
            )
        ;
    }

    Character.fadeOut(1000);
    SupplierScreen.fadeIn(1000);
}

SupplierScreenButton_Home.click(function () {
    showMainScreen(SupplierScreen);
    name = "";
});
SupplierProduct_CokeEdit.click(function () {
    if (SupplierProduct_CokeEdit.text() === "Save") {
        editProductQty(products.coke - takeCoke, products.sprite);

        SupplierProduct_CokeEdit.text("Edit");
        takeCoke = 0;
        SupplierProduct_CokeQty.text(products.coke);

        SupplierProduct_CokeRemove.hide();
        SupplierProduct_CokeAdd.hide();
        SupplierProduct_CokeCancel.hide();
    } else {
        SupplierProduct_CokeEdit.text("Save");

        SupplierProduct_CokeRemove.show();
        SupplierProduct_CokeAdd.show();
        SupplierProduct_CokeCancel.show();
    }
});

SupplierProduct_CokeCancel.click(function () {
    SupplierProduct_CokeEdit.text("Edit");
    takeCoke = 0;
    SupplierProduct_CokeQty.text(products.coke);

    SupplierProduct_CokeRemove.hide();
    SupplierProduct_CokeAdd.hide();
    SupplierProduct_CokeCancel.hide();
});

SupplierProduct_CokeRemove.click(function () {
    takeCoke += 1;
    SupplierProduct_CokeQty.text(products.coke - takeCoke);
});

SupplierProduct_CokeAdd.click(function () {
    takeCoke -= 1;
    SupplierProduct_CokeQty.text(products.coke - takeCoke);
});

SupplierProduct_SpriteEdit.click(function () {
    if (SupplierProduct_SpriteEdit.text() === "Save") {
        editProductQty(products.coke, products.sprite - takeSprite);

        SupplierProduct_SpriteEdit.text("Edit");
        takeSprite = 0;
        SupplierProduct_SpriteQty.text(products.sprite);

        SupplierProduct_SpriteRemove.hide();
        SupplierProduct_SpriteAdd.hide();
        SupplierProduct_SpriteCancel.hide();
    } else {
        SupplierProduct_SpriteEdit.text("Save");

        SupplierProduct_SpriteRemove.show();
        SupplierProduct_SpriteAdd.show();
        SupplierProduct_SpriteCancel.show();
    }


    SupplierProduct_SpriteRemove.show();
    SupplierProduct_SpriteAdd.show();
    SupplierProduct_SpriteCancel.show();
});

SupplierProduct_SpriteCancel.click(function () {
    SupplierProduct_SpriteEdit.text("Edit");
    takeSprite = 0;
    SupplierProduct_SpriteQty.text(products.sprite);

    SupplierProduct_SpriteRemove.hide();
    SupplierProduct_SpriteAdd.hide();
    SupplierProduct_SpriteCancel.hide();
});

SupplierProduct_SpriteRemove.click(function () {
    takeSprite += 1;
    SupplierProduct_SpriteQty.text(products.sprite - takeSprite);
});

SupplierProduct_SpriteAdd.click(function () {
    takeSprite -= 1;
    SupplierProduct_SpriteQty.text(products.sprite - takeSprite);
});

Debug_Text.click(function () {
    location.reload();
})


//#endregion

//#region jellyfish
TweenMax.to("#feturbulence", 5, {
    attr: {baseFrequency: "0.06 0"},
    repeat: -1,
    yoyo: true,
    ease: Linear.easeNone
});

TweenMax.to(
    ".jellyfish",
    3,
    {
        y: -30,
        repeat: -1,
        yoyo: true,
        ease: Linear.easeNone
    },
    0.2
);

TweenMax.staggerFrom(
    ".bubble",
    4,
    {
        scale: 0.2,
        opacity: 0.2,
        repeat: -1,
        yoyo: true,
        svgOrigin: "center",
        ease: Linear.easeNone
    },
    1
);

var blink = new TimelineMax({repeat: -1, repeatDelay: 5});
blink
    .to(".eye", 0.5, {
        scaleY: 0.5,
        opacity: 0.2,
        svgOrigin: "center",
        delay: 3,
        ease: Back.easeOut.config(1.7)
    })
    .to(".eye", 0.5, {
        scaleY: 1,
        opacity: 1,
        svgOrigin: "center",
        ease: Back.easeOut.config(1.7)
    });


//#endregion