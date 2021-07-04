"use strict";

module.exports.basicAuthorizer = async (event, context, cb) => {

  const validUserName = process.env.USER_ID;
  const validUserPassword = process.env.PASSWORD;

  if (event["type"] !== "TOKEN") {
    return cb("Unauthorized");
  }

  try {
    const { authorizationToken, methodArn } = event;
    const [, encodedCreds] = authorizationToken.split(" ");
    const [username, password] = Buffer.from(encodedCreds, "base64")
      .toString()
      .split(":");

    const effect =
      validUserName === username && validUserPassword === password
        ? "Allow"
        : "Deny";

    const policy = generatePolicy(encodedCreds, methodArn, effect);
    cb(null, policy);
  } catch (e) {
    return cb(`Unauthorized: ${e.message}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Successfully authorized",
        input: event,
      },
      null,
      2
    ),
  };
};

function generatePolicy(principalId, resource, effect = "Allow") {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Action: "execute-api:Invoke",
          Resource: resource,
        },
      ],
    },
  };
}
