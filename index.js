const { app, BrowserWindow, Tray, Menu, nativeImage  } = require('electron');
// npx electron-packager ./ --platform=win32 --arch=x64 --icon=assets/favicon.ico --overwrite



const path = require('path')
const os = require('os');
const mqtt = require('mqtt');

const { spawn } = require('child_process');
// const nodePath = path.join(path.dirname(app.getPath('exe')), 'node.exe');
// var exec = require('child_process').exec;
const { execFile } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

var user_mqtt = process.env.MQTT_USER;
var user_pass = process.env.MQTT_PASSWORD ;

if (process.env.MQTT_PASS == 'TRUE') {
  client = mqtt.connect(process.env.MQTT_IP, {
      username:user_mqtt,
      password:user_pass
  });
}else{
  client = mqtt.connect(process.env.MQTT_IP);
}


var ping_topic = {
  'traffic_control':'traffic_control', //MAYBE tambahan id di .env atau variable
  'traffic_online':'traffic_online',
  'adaptif_traffic':'adaptif_traffic',
  'greenwave_koordinasi':'greenwave_koordinasi',
  'camera_single':'camera_single',
  'camera_multi':'camera_multi',
};
var test =1;
var ping_limit = 5;
var cpu_percentage = '';

//variable untuik cek limit server
var server_limit = {
  "traffic_control": 0,
  "traffic_online": 0,
  "adaptif_traffic": 0,
  "greenwave_koordinasi": 0,
  "camera_single": 0,
  "camera_multi": 0,
}


client.on('connect', function(){
  console.log('service server telah terkoneksi ke mqtt server');
  client.subscribe('#', function (err) {
      if (!err) {
          client.publish('Server_Management','server connected');
      }
  });
});




client.on('message', function(topic, message) {
   var message_parse = message.toString(); 

      if (topic.includes('directs_server_management')) {
    
        if (message_parse.includes('PING:traffic_control_server')) {
          server_limit.traffic_control = 0;
          return;
        }

        if (message_parse.includes('PING:traffic_online_server')) {
          server_limit.traffic_online = 0;
          return;
        }

        if (message_parse.includes('PING:adaptif_traffic_server')){
          server_limit.adaptif_traffic = 0;
          return;
        }

        if (message_parse.includes('PING:greenwave_koordinasi_server')){
          server_limit.greenwave_koordinasi = 0;
          return;
        }

        if (message_parse.includes('PING:server_camera_multi')){
          server_limit.camera_multi = 0;
          return;
        }
        if (message_parse.includes('PING:server_camera_single')){
          server_limit.camera_single = 0;
          return;
        }
        
      }

});


const createWindow = () => {

  const win = new BrowserWindow({
    width: 500,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    icon: __dirname + '/assets/favicon.ico',
  });

  win.loadFile('index.html');

      // Update the <h5> element with the value of the `test` variable every 3 seconds
      setInterval(() => {
        var cpuUsage = os.cpus();
        var totalMemory = os.totalmem();
        var freeMemory = os.freemem();
        // cpuUsage = cpuUsage * 100;
        totalMemory = Math.round(totalMemory / (1024 * 1024));
        freeMemory = Math.round(freeMemory / (1024 * 1024));
        var usedMemory = totalMemory - freeMemory;


        // win.webContents.executeJavaScript(`document.getElementById('test').innerText = '${test}';`);
    
        win.webContents.executeJavaScript(`document.getElementById('cpu-percentage').innerText = '${cpu_percentage}';`);
        win.webContents.executeJavaScript(`document.getElementById('free-memory').innerText = 'Free ${freeMemory}';`);
        win.webContents.executeJavaScript(`document.getElementById('used-memory').innerText = 'Used ${usedMemory}';`);

        // Indikator running dan stopped
        var traffic_control_html = `document.getElementById('traffic_control_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-red">  <span > <i class="fa fa-circle text-red"></i> <b>Stopped</b> </span></h4>';`

        var traffic_online_html = `document.getElementById('traffic_onlilne_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-red">  <span > <i class="fa fa-circle text-red"></i> <b>Stopped</b> </span></h4>';`
     
        var traffic_adaptif_actived = `document.getElementById('traffic_adaptif_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-red">  <span > <i class="fa fa-circle text-red"></i> <b>Stopped</b> </span></h4>';`
     
        var greenwave_koordinasi_html = `document.getElementById('greenwave_koordinasi_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-red">  <span > <i class="fa fa-circle text-red"></i> <b>Stopped</b> </span></h4>';`
     
        var camera_single_html = `document.getElementById('camera_single_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-red">  <span > <i class="fa fa-circle text-red"></i> <b>Stopped</b> </span></h4>';`
       
        var camera_multi_html = `document.getElementById('camera_multi_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-red">  <span > <i class="fa fa-circle text-red"></i> <b>Stopped</b> </span></h4>';`
       
        // console.log('tes',server_limit.traffic_control);
        console.log('tes traffic_control',server_limit.traffic_online);

        if (server_limit.traffic_control <= ping_limit ) {      
          traffic_control_html =   `document.getElementById('traffic_control_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-green">  <span > <i class="fa fa-circle text-green"></i> <b>Running</b> </span></h4>';`
        }

        if(server_limit.traffic_online <= ping_limit){
          traffic_online_html = `document.getElementById('traffic_onlilne_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-green">  <span > <i class="fa fa-circle text-green"></i> <b>Running</b> </span></h4>';`
        }

        if(server_limit.adaptif_traffic <= ping_limit){
          traffic_adaptif_actived = `document.getElementById('traffic_adaptif_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-green">  <span > <i class="fa fa-circle text-green"></i> <b>Running</b> </span></h4>';`
        }

        if(server_limit.greenwave_koordinasi <= ping_limit){
          greenwave_koordinasi_html = `document.getElementById('greenwave_koordinasi_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-green">  <span > <i class="fa fa-circle text-green"></i> <b>Running</b> </span></h4>';`
        }

        if(server_limit.camera_multi <= ping_limit){
          camera_multi_html = `document.getElementById('camera_multi_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-green">  <span > <i class="fa fa-circle text-green"></i> <b>Running</b> </span></h4>';`
        }

        if(server_limit.camera_single <= ping_limit){
          camera_single_html = `document.getElementById('camera_single_actived').innerHTML = ' <h4 style="margin-top:12px;"  class="text-green">  <span > <i class="fa fa-circle text-green"></i> <b>Running</b> </span></h4>';`
        }
        

        console.log('server_limit.camera_multi :',server_limit.camera_multi);
        console.log('server_limit.camera_single :',server_limit.camera_single);


        win.webContents.executeJavaScript(traffic_online_html);
        win.webContents.executeJavaScript(traffic_control_html);
        win.webContents.executeJavaScript(traffic_adaptif_actived);
        win.webContents.executeJavaScript(greenwave_koordinasi_html);
  

        win.webContents.executeJavaScript(camera_multi_html);
        win.webContents.executeJavaScript(camera_single_html);
        //traffic online
       
        
      }, 3000);

};


Menu.setApplicationMenu(null)

app.whenReady().then(() => {
  createWindow()
})


// Auto start saat windows login
app.setLoginItemSettings({ 
  openAtLogin: true    
})



// CPU PERCENTAGE KODE 
function cpuAverage() {
  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();

  //Loop through CPU cores
  for(var i = 0, len = cpus.length; i < len; i++) {

    //Select CPU core
    var cpu = cpus[i];

    //Total up the time in the cores tick
    for(type in cpu.times) {
      totalTick += cpu.times[type];
   }     
    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }
  //Return the average Idle and Tick times
  return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

//Grab first CPU Measure
var startMeasure = cpuAverage();
//Set delay for second Measure
setInterval(() => {
  var endMeasure = cpuAverage(); 

  //Calculate the difference in idle and total time between the measures
  var idleDifference = endMeasure.idle - startMeasure.idle;
  var totalDifference = endMeasure.total - startMeasure.total;

  //Calculate the average percentage CPU usage
  var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
  cpu_percentage = percentageCPU;
  //Output result to console
   startMeasure = cpuAverage();
}, 2000);
// END CPU PERCENTAGE KODE 



// Cek Status active server backend node js
setInterval(() => {
  check_koneksi(); //check koenksi server management dan suma server directs
}, 30000);



traffic_control_actived(); 
traffic_online_actived(); 
traffic_adaptive_actived(); 
traffic_greenwave_actived(); 
camera_multi_actived(); 
camera_single_actived();

function check_koneksi() {
  var traffic_control_data = server_limit.traffic_control + 1;
  var traffic_online_data = server_limit.traffic_online +1;
  var traffic_adaptif_data = server_limit.adaptif_traffic+1;
  var greenwave_koordinasi_data = server_limit.greenwave_koordinasi+1;

  var camera_single = server_limit.camera_single+1;
  var camera_multi = server_limit.camera_multi+1;
  
  if (traffic_control_data > 7) { //ping_limit
    traffic_control_actived(); 
    traffic_control_data = 0;
  }

  if (traffic_online_data > 7) { //ping_limit
    traffic_online_actived(); 
    traffic_online_data = 0;
  }

  if (traffic_adaptif_data > 7) { //ping_limit
    traffic_adaptive_actived(); 
    traffic_adaptif_data = 0;
  }

  if (greenwave_koordinasi_data > 7) { //ping_limit
    // traffic_greenwave_actived(); 
    greenwave_koordinasi_data = 0;
  }
  
  if (camera_multi > 7) { //ping_limit
    camera_multi_actived(); 
    camera_multi = 0;
  }

  if (camera_single > 7) { //ping_limit
    camera_single_actived();
    camera_single = 0;
  }


  server_limit.traffic_control = traffic_control_data;
  server_limit.traffic_online = traffic_online_data;
  server_limit.adaptif_traffic = traffic_adaptif_data;
  server_limit.greenwave_koordinasi = greenwave_koordinasi_data;
  server_limit.camera_single = camera_single;
  server_limit.camera_multi = camera_multi;

  // server ping dengan mqtt
  client.publish(ping_topic.traffic_control,'PING');
  client.publish(ping_topic.traffic_online,'PING');
  client.publish(ping_topic.adaptif_traffic,'PING');
  client.publish(ping_topic.greenwave_koordinasi,'PING');
  client.publish(ping_topic.camera_multi,'PING');
  client.publish(ping_topic.camera_single,'PING');

}

// traffic_online_actived()

// Fungsi fungsi untuk mengaktifkan server traffic
function traffic_control_actived() {
  

  let path_test = path.join(__dirname, "../javis_websocket_directs/index.js");
  const batchProcess = execFile('node.exe', [path_test])
  batchProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);

  });

  batchProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);

  });

  batchProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);

  });

}

// END Fungsi fungsi untuk mengaktifkan server traffic
// Fungsi fungsi untuk mengaktifkan server traffic Online
function traffic_online_actived() {

  let path_test = path.join(__dirname, "../javis_websocket_directs_online_check/index.js");
  const batchProcess = execFile('node.exe', [path_test])
  batchProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);

  });

  batchProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);

  });

  batchProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);

  });

}
// END Fungsi fungsi untuk mengaktifkan traffic Online

// Fungsi fungsi untuk mengaktifkan server traffic Online
function traffic_adaptive_actived() {
  
  
  let path_test = path.join(__dirname, "../adaptif_traffic/index.js");
  const batchProcess = execFile('node.exe', [path_test])
  batchProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);

  });

  batchProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);

  });

  batchProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);

  });

}
// END Fungsi fungsi untuk mengaktifkan traffic Online

// Fungsi fungsi untuk mengaktifkan server traffic Online
function traffic_greenwave_actived() {

  let path_test = path.join(__dirname, "../coordination_service/greenwave.js");
  const batchProcess = execFile('node.exe', [path_test])
  batchProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);

  });

  batchProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);

  });

  batchProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);

  });

}

// END Fungsi fungsi untuk mengaktifkan traffic_parameter_actived

// start  fungsi untuk mengaktifkan camera Multi

function camera_multi_actived() {

  
  let path_test = path.join(__dirname, "../server_ip_camera_multi/index.js");
  const batchProcess = execFile('node.exe', [path_test])
  batchProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);

  });

  batchProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);

  });

  batchProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);

  });

}
// END fungsi untuk mengaktifkan camera Multi
// start  fungsi untuk mengaktifkan camera Multi


function camera_single_actived() {


    let path_test = path.join(__dirname, "../server_ip_camera/index.js");

    const batchProcess = execFile('node.exe', [path_test]);
    batchProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);

    });

    batchProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);

    });

    batchProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);

    });

}
// END fungsi untuk mengaktifkan camera Multi
