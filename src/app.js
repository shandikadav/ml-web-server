const hapi = require("@hapi/hapi");
const { loadModel, predict } = require("./inference");

async () => {
  const model = await loadModel();
  console.log("Model loaded!");

  // initializing server
  const server = hapi.server({
    host: process.ENV.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
    port: 3000,
  });

  server.route({
    method: "POST",
    path: "/predicts",
    handler: async (request) => {
      // get image
      const { image } = request.payload;
      // do and get prediction
      const predictions = await predict(model, image);
      // get prediction result
      const { paper, rock } = predictions;

      if (paper) {
        return { result: "paper" };
      }
      if (rock) {
        return { result: "rock" };
      }

      return { result: "scissor" };
    },

    // make request payload
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
      },
    },
  });

  await server.start();
  console.log(`Server start at: ${server.info.uri}`);
};
