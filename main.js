/**
 * Created by Araros on 18/04/2016.
 */
var Leap = require('leapjs'); // permet fonctionnement du leap motion.
var controller  = new Leap.Controller({enableGestures: true}); // Creation d'un controller leap motion. Cela permet de récupérer les données voulues à chaque frame (cette méthode confére plus d'options (gestures etc)).
var net = require('net'); // Pour creation de serveur, sockets.
var Cylon = require('cylon');
var arDrone = require('ar-drone');

 //-------------DRONES-------------

/*On créé d'abord les différents robots (drones) et leurs connections grâce à cylon.js.
 * La fonction work indique les différents ordres au drone. */
process.setMaxListeners(0);//Listeners illimités.

Cylon.robot({

    //Déclaration des connections et des appareils.
    connections: {
        ardrone1: {adaptor: 'ardrone', port: '192.168.1.200'},
        ardrone2: {adaptor: 'ardrone', port: '192.168.1.201'}

    },

    devices: {
        drone1: { driver: 'ardrone', connection :'ardrone1'},
        drone2: {driver: 'ardrone',connection :'ardrone2' }
    },

    work: function(my){

        //my.drone1.takeoff();
        //my.drone2.takeoff();

        //Sécurité: Les drones se posent après x seconds.
        after((60).seconds(), function() {
            console.log("land drone");
            my.drone1.land();
            my.drone2.land();
        });

        //A chaque event frame on execute la fonction qui prend en paramètre un objet de type Frame.
        controller.on('frame', function (frame) {

            var droneSpeed = 1;// vitesse du drone.
            var arrayLengthHand = frame.hands.length;//Correspond au nombre de mains présentes dans la frame.

            if(arrayLengthHand != 0){

                for(var h = 0; h < arrayLengthHand; h++){//On rempli un tableau avec des objets de type Hand à la frame actuelle.

                    var hand = frame.hands[h];
                    var handPosition = hand.palmPosition; //Position de la paume de la main.
                    var normal = hand.palmNormal;//
                    var normal_x =  normal[0].toFixed(2);//On arrondit.
                    var drone_1 = my.drone1;
                    var drone_2 = my.drone2;
                    var radiusHand = parseInt(hand.sphereRadius);

                    //Affiche les coordonnées de la main dans la frame.

                    //console.log("postion x: " +handPosition[0] + " de la main : " + hand.type);
                    //console.log("postion y: " +handPosition[1] + " de la main : " + hand.type);
                    //console.log("postion z: " +handPosition[2] + " de la main : " + hand.type);
                    //console.log(normal_x);
                    //console.log(radiusHand);

                    //---Non utilisé----

                    //var normal_z = normal[2].toFixed(2);
                    //console.log(normal_z);

                    //-----Fonction de controle du drone en fonction de la main.
                    if(hand.type == "right") {
                        droneControls(drone_2,normal_x,handPosition,droneSpeed,radiusHand);
                    }
                    if(hand.type == "left") {
                        droneControls(drone_1,normal_x,handPosition,droneSpeed,radiusHand);
                    }
                }

                //Récupére les différents gestes associé à la main.
                frame.gestures.forEach(function(gesture){
                    var handIds = gesture.handIds;
                    handIds.forEach(function(handId){
                        var hand = frame.hand(handId);
                        if(hand.type == "right") {
                            //console.log("geste main droite");
                            if(gesture.type == "keyTap"){
                                console.log("keyTap droite: arrete drone");
                                my.drone2.land();//Le drone se pose et s'arrête sur un keyTap.
                            }
                            if(gesture.type == "swipe"){
                                console.log("swipe droite: decollage drone");
                                my.drone2.takeoff();//Le drone décolle sur un swipe.
                            }

                        }
                        if(hand.type == "left") {
                            //console.log("geste main gauche");
                            if(gesture.type == "keyTap"){
                                console.log("keyTap gauche: arrete drone");
                                my.drone1.land();//Le drone se pose et s'arrête sur un keyTap.
                            }
                            if(gesture.type == "swipe"){
                                console.log("swipe gauche: decollage drone");
                                my.drone1.takeoff();//Le drone décolle sur un swipe.
                            }
                        }
                    });
                });

            }
            else{
                //console.log("Pas de mains : Le drone arrête tout mouvement en cours.");
                my.drone1.stop();
                my.drone2.stop();
            }

        });
    }
}).start();
//---------------FIN DRONES---------------


//------------FONCTION DE CONTROLE D'UN DRONE----------------

/* Cela fonctionne comme un "joystick": La position centrale de la main correspond au neutre.
* Tant que la main est dirigé (ou penché pour le droite/gauche voir ci dessous)dans une direction le drone continue d'executer le mouvement associé à cette direction.
* Il est possible d'associer deux mouvements en même temps (exemple haut droite).
* Fermer le poing permet de faire tourner le drone dans le sens horraire.
* Lorsque la main revient en position neutre, le drone arrête donc ce mouvement (drone.stop()).
* Attention à TOUJOURS revenir en position neutre pour arrêter un mouvement.
* Si par exemple vous montez la main vers le haut penché vers la droite, le drone montera en diagonale. Si vous voulez continuer à monter vous devez d'abord passer par la position neutre (sinon le drone continuera d'aller vers la droite).
* */
var droneControls = function(drone,normal_x,handPosition,droneSpeed,radiusHand){

    //Position neutre: le drone arrête tout mouvement.
    if(normal_x> -0.6 && normal_x< 0.6 && handPosition[1]>120 && handPosition[1]<220 && handPosition[2]>-100 && handPosition[2]<100)
    {
        console.log("Ne fais rien.");
        drone.stop();
    }else{
        if (handPosition[2] < -100) {
            console.log("devant");
            drone.forward(droneSpeed);
        }
        else if (handPosition[2] > 100) {
            console.log("derriere");
            drone.back(droneSpeed);
        }

        /*Pour la fonction gauche droite, on penche la main plutôt que de la déplacer.
        *En effet cela évite que les mains se superposent et donc qu'une des deux soit caché aux yeux du leap motion.*/
        if(normal_x< -0.6){
            console.log("droite");
            drone.right(droneSpeed);
        }
        else if(normal_x>0.6) {
            console.log("gauche");
            drone.left(droneSpeed);
        }
        if(handPosition[1] > 220){
            console.log("monte");
            drone.up(droneSpeed);
        }
        else if(handPosition[1] < 120) {
            console.log("descend");
            drone.down(droneSpeed);
        }
        if(radiusHand < 40){
            console.log("Tourne sens horraire.");
            drone.clockwise(droneSpeed);
        }
    }
};

////------------FIN FONCTION DE CONTROLE D'UN DRONE----------------

// On affiche différentes informations en fonction de l'evenement associé au controller du leap motion.
controller.on('connect', function(){
    console.log("--Running program--");
});

controller.on('streamingStarted', function(){
    console.log("Leap connected.");
});

controller.on('streamingStopped', function() {
    console.log("Leap disconnected.");
});

controller.connect();// Active le controller.

