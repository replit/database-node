async function getToken() {
  if (process.env.REPL_ID) {
    // testing locally
    return undefined;
  } else {
    // testing from CI
    const pass = process.env.USE_FILE
      ? process.env.RIDT_PASSWORD
      : process.env.JWT_PASSWORD;
    const url = process.env.USE_FILE
      ? "https://database-test-ridt-util.replit.app"
      : "https://database-test-jwt-util.replit.app";
    const resp = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`test:${pass}`).toString(
          "base64",
        )}`,
      },
    });
    return await resp.text();
  }
}

module.exports = {
  getToken,
}
