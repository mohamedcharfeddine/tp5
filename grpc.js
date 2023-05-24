const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mysql = require("mysql");

const PROTO_PATH = __dirname + "/my-service.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const serviceProto = grpc.loadPackageDefinition(packageDefinition).myservice;

const myService = {
  getRecord: (call, callback) => {
    const id = call.request.id;

    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "db",
    });

    connection.connect((err) => {
      if (err) throw err;

      connection.query("SELECT * FROM records WHERE id = ?", [id], (error, results) => {
        if (error) {
          console.error(error);
          callback(error);
          return;
        }

        const record = results[0];
        callback(null, { record: record });
      });

      connection.end();
    });
  },
};

const server = new grpc.Server();
server.addService(serviceProto.MyService.service, myService);
server.bindAsync("127.0.0.1:50051", grpc.ServerCredentials.createInsecure(), () => {
  console.log("listening on port 50051");
  server.start();
});
