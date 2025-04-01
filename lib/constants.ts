export const defaultHTML = `<!DOCTYPE html>
<html>
  <head>
    <title>My app</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="utf-8">
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100dvh;
        font-family: "Arial", sans-serif;
        text-align: center;
      }
      .mascot {
        position: absolute;
        bottom: 32px;
        left: 0px;
        width: 100px;
      }
      h1 {
        font-size: 50px;
      }
      h1 span {
        color: #ec4899;
        font-size: 32px;
      }
      @media screen and (max-width: 640px) {
        .mascot {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <h1>
      <span>I'm ready to help,</span><br />
      Ask iLy anything.
    </h1>
    <img src="/mascot.png" class="mascot" />
    <script></script>
  </body>
</html>
`

