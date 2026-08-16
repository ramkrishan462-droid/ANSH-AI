```javascript
exports.handler = async (event) => {
  try {

    const body = JSON.parse(event.body || "{}");
    const messages = body.messages || [];

    const lastMessage =
      messages.length > 0
        ? messages[messages.length - 1].content
        : "Hello";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answer: "ANSH AI Reply: " + lastMessage
      })
    };

  } catch (error) {

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: error.message
      })
    };

  }
};
```
