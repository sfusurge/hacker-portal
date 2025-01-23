export const welcomeEmailTemplate = `
  <!doctype html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>🎉 StormHacks Information</title>
      <style type="text/css">
        p {
          margin: 10px 0;
          padding: 0;
        }
  
        table {
          border-collapse: collapse;
        }
  
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          display: block;
          margin: 0;
          padding: 0;
        }
  
        img,
        a img {
          border: 0;
          height: auto;
          outline: none;
          text-decoration: none;
        }
  
        body,
        #bodyTable,
        #bodyCell {
          height: 100%;
          margin: 0;
          padding: 0;
          width: 100%;
        }
  
        .mcnPreviewText {
          display: none !important;
        }
  
        #outlook a {
          padding: 0;
        }
  
        img {
          -ms-interpolation-mode: bicubic;
        }
  
        table {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
  
        .ReadMsgBody {
          width: 100%;
        }
  
        .ExternalClass {
          width: 100%;
        }
  
        p,
        a,
        li,
        td,
        blockquote {
          mso-line-height-rule: exactly;
        }
  
        a[href^=tel],
        a[href^=sms] {
          color: inherit;
          cursor: default;
          text-decoration: none;
        }
  
        p,
        a,
        li,
        td,
        body,
        table,
        blockquote {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
  
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass td,
        .ExternalClass div,
        .ExternalClass span,
        .ExternalClass font {
          line-height: 100%;
        }
  
        a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
  
        table[align=left] {
          float: left;
        }
  
        table[align=right] {
          float: right;
        }
  
        #bodyCell {
          padding: 10px;
        }
  
        .templateContainer {
          max-width: 600px !important;
        }
  
        a.mcnButton {
          display: block;
        }
  
        .mcnImage,
        .mcnRetinaImage {
          vertical-align: bottom;
        }
  
        .mcnTextContent {
          word-break: break-word;
        }
  
        .mcnTextContent img {
          height: auto !important;
        }
  
        .mcnDividerBlock {
          table-layout: fixed !important;
        }
  
        body,
        #bodyTable {
          background-color: #FAFAFA;
        }
  
        #bodyCell {
          border-top: 0;
        }
  
        .templateContainer {
          border: 0;
        }
  
        h1 {
          color: #202020;
          font-family: Helvetica;
          font-size: 26px;
          font-style: normal;
          font-weight: bold;
          line-height: 125%;
          letter-spacing: normal;
          text-align: left;
        }
  
        h2 {
          color: #202020;
          font-family: Helvetica;
          font-size: 22px;
          font-style: normal;
          font-weight: bold;
          line-height: 125%;
          letter-spacing: normal;
          text-align: left;
        }
  
        h3 {
          color: #202020;
          font-family: Helvetica;
          font-size: 20px;
          font-style: normal;
          font-weight: bold;
          line-height: 125%;
          letter-spacing: normal;
          text-align: left;
        }
  
        h4 {
          color: #202020;
          font-family: Helvetica;
          font-size: 18px;
          font-style: normal;
          font-weight: bold;
          line-height: 125%;
          letter-spacing: normal;
          text-align: left;
        }
  
        #templatePreheader {
          background-color: #FAFAFA;
          background-image: none;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          border-top: 0;
          border-bottom: 0;
          padding-top: 9px;
          padding-bottom: 9px;
        }
  
        #templatePreheader .mcnTextContent,
        #templatePreheader .mcnTextContent p {
          color: #656565;
          font-family: Helvetica;
          font-size: 12px;
          line-height: 150%;
          text-align: left;
        }
  
        #templatePreheader .mcnTextContent a,
        #templatePreheader .mcnTextContent p a {
          color: #656565;
          font-weight: normal;
          text-decoration: underline;
        }
  
        #templateHeader {
          background-color: #FFFFFF;
          background-image: none;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          border-top: 0;
          border-bottom: 0;
          padding-top: 9px;
          padding-bottom: 0;
        }
  
        #templateHeader .mcnTextContent,
        #templateHeader .mcnTextContent p {
          color: #202020;
          font-family: Helvetica;
          font-size: 16px;
          line-height: 150%;
          text-align: left;
        }
  
        #templateHeader .mcnTextContent a,
        #templateHeader .mcnTextContent p a {
          color: #007C89;
          font-weight: normal;
          text-decoration: underline;
        }
  
        #templateBody {
          background-color: #FFFFFF;
          background-image: none;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          border-top: 0;
          border-bottom: 2px solid #EAEAEA;
          padding-top: 0;
          padding-bottom: 9px;
        }
  
        #templateBody .mcnTextContent,
        #templateBody .mcnTextContent p {
          color: #202020;
          font-family: Helvetica;
          font-size: 16px;
          line-height: 150%;
          text-align: left;
        }
  
        #templateBody .mcnTextContent a,
        #templateBody .mcnTextContent p a {
          color: #007C89;
          font-weight: normal;
          text-decoration: underline;
        }
  
        #templateFooter {
          background-color: #FAFAFA;
          background-image: none;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          border-top: 0;
          border-bottom: 0;
          padding-top: 9px;
          padding-bottom: 9px;
        }
  
        #templateFooter .mcnTextContent,
        #templateFooter .mcnTextContent p {
          color: #656565;
          font-family: Helvetica;
          font-size: 12px;
          line-height: 150%;
          text-align: center;
        }
  
        #templateFooter .mcnTextContent a,
        #templateFooter .mcnTextContent p a {
          color: #656565;
          font-weight: normal;
          text-decoration: underline;
        }
  
        @media only screen and (min-width:768px) {
          .templateContainer {
            width: 600px !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          body,
          table,
          td,
          p,
          a,
          li,
          blockquote {
            -webkit-text-size-adjust: none !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          body {
            width: 100% !important;
            min-width: 100% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          .mcnRetinaImage {
            max-width: 100% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          .mcnImage {
            width: 100% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          .mcnCartContainer,
          .mcnCaptionTopContent,
          .mcnRecContentContainer,
          .mcnCaptionBottomContent,
          .mcnTextContentContainer,
          .mcnBoxedTextContentContainer,
          .mcnImageGroupContentContainer,
          .mcnCaptionLeftTextContentContainer,
          .mcnCaptionRightTextContentContainer,
          .mcnCaptionLeftImageContentContainer,
          .mcnCaptionRightImageContentContainer,
          .mcnImageCardLeftTextContentContainer,
          .mcnImageCardRightTextContentContainer,
          .mcnImageCardLeftImageContentContainer,
          .mcnImageCardRightImageContentContainer {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          .mcnBoxedTextContentContainer {
            min-width: 100% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          .mcnImageGroupContent {
            padding: 9px !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          .mcnCaptionLeftContentOuter .mcnTextContent,
          .mcnCaptionRightContentOuter .mcnTextContent {
            padding-top: 9px !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          .mcnImageCardTopImageContent,
          .mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,
          .mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent {
            padding-top: 18px !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          .mcnImageCardBottomImageContent {
            padding-bottom: 9px !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          .mcnImageGroupBlockInner {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          .mcnImageGroupBlockOuter {
            padding-top: 9px !important;
            padding-bottom: 9px !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          .mcnTextContent,
          .mcnBoxedTextContentColumn {
            padding-right: 18px !important;
            padding-left: 18px !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          .mcnImageCardLeftImageContent,
          .mcnImageCardRightImageContent {
            padding-right: 18px !important;
            padding-bottom: 0 !important;
            padding-left: 18px !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          .mcpreview-image-uploader {
            display: none !important;
            width: 100% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          h1 {
            font-size: 22px !important;
            line-height: 125% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          h2 {
            font-size: 20px !important;
            line-height: 125% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          h3 {
            font-size: 18px !important;
            line-height: 125% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          h4 {
            font-size: 16px !important;
            line-height: 150% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          .mcnBoxedTextContentContainer .mcnTextContent,
          .mcnBoxedTextContentContainer .mcnTextContent p {
            font-size: 14px !important;
            line-height: 150% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
          #templatePreheader {
            display: block !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          #templatePreheader .mcnTextContent,
          #templatePreheader .mcnTextContent p {
            font-size: 14px !important;
            line-height: 150% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          #templateHeader .mcnTextContent,
          #templateHeader .mcnTextContent p {
            font-size: 16px !important;
            line-height: 150% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          #templateBody .mcnTextContent,
          #templateBody .mcnTextContent p {
            font-size: 16px !important;
            line-height: 150% !important;
          }
        }
  
        @media only screen and (max-width: 480px) {
  
          #templateFooter .mcnTextContent,
          #templateFooter .mcnTextContent p {
            font-size: 14px !important;
            line-height: 150% !important;
          }
        }
      </style>
    </head>
    <body style="height: 100%;margin: 0;padding: 0;width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #FAFAFA;">

      <span class="mcnPreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">Surge is excited to welcome you as a judge to StormHacks!</span>
      <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 0;width: 100%;background-color: #FAFAFA;">
          <tr>
            <td align="center" valign="top" id="bodyCell" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;height: 100%;margin: 0;padding: 10px;width: 100%;border-top: 0;">
  
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;border: 0;max-width: 600px !important;">
                <tr>
                  <td valign="top" id="templatePreheader" style="background:#FAFAFA none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #FAFAFA;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 9px;padding-bottom: 9px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                      <tbody class="mcnTextBlockOuter">
                        <tr>
                          <td valign="top" class="mcnTextBlockInner" style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
  
                            <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;float: left;" width="100%" class="mcnTextContentContainer">
                              <tbody>
                                <tr>
                                  <td valign="top" class="mcnTextContent" style="padding: 0px 18px 9px;text-align: center;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #656565;font-family: Helvetica;font-size: 12px;line-height: 150%;">
                                    <a href="https://mailchi.mp/cb1e40c3f220/youre-invited-to-october-stormhacks-2024-confirm-your-spot-17397288?e=[UNIQID]" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #656565;font-weight: normal;text-decoration: underline;">View this email in your browser</a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
  
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top" id="templateHeader" style="background:#FFFFFF none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #FFFFFF;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 9px;padding-bottom: 0;"></td>
                </tr>
                <tr>
                  <td valign="top" id="templateBody" style="background:#FFFFFF none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #FFFFFF;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 2px solid #EAEAEA;padding-top: 0;padding-bottom: 9px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                      <tbody class="mcnTextBlockOuter">
                        <tr>
                          <td valign="top" class="mcnTextBlockInner" style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;float: left;" width="100%" class="mcnTextContentContainer">
                              <tbody>
                                <tr>
                                  <td valign="top" class="mcnTextContent" style="padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                    <h1 class="null" data-pm-slice="1 1 []" style="text-align: center;display: block;margin: 0;padding: 0;color: #202020;font-family: Helvetica;font-size: 26px;font-style: normal;font-weight: bold;line-height: 125%;letter-spacing: normal;">
                                      <img alt="" data-block-id="18" height="auto" role="presentation" src="https://dim.mcusercontent.com/cs/d3bb8ced202236642d005f468/images/6303b291-d535-0c35-d4fc-e993cd7279af.png?w=660&dpr=2" width="660" style="border: 0;height: auto !important;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;">
                                      <br>
                                      <br>
                                      <span style="color:#4d2465">
                                        <strong>
                                          <span style="font-size:31px">
                                            <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Welcome to JourneyHacks, {{firstName}}!</span>
                                            <img src="cid:qrcode"/>
                                          </span>
                                        </strong>
                                      </span>
                                    </h1>
                                    <h1 class="null" style="text-align: center;display: block;margin: 0;padding: 0;color: #202020;font-family: Helvetica;font-size: 26px;font-style: normal;font-weight: bold;line-height: 125%;letter-spacing: normal;">
                                      <span style="color:#E993FF">
                                        <strong>
                                          <span style="font-size:18px">
                                            <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Important Event Information</span>
                                          </span>
                                        </strong>
                                      </span>
                                    </h1>
                                    <p style="text-align: center;margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;">&nbsp;</p>
                                    <p style="text-align: left;margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;">
                                      <font color="#4d2465">
                                        <span style="font-size:18px">
                                          <strong>Dear Judges,</strong>
                                        </span>
                                      </font>
                                    </p>
                                    <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">We are looking forward to welcoming you to Simon Fraser University&nbsp;Burnaby&nbsp;on October&nbsp;6th!&nbsp;To ensure you have a safe and enjoyable experience, we would like to provide you with some essential information prior to the event. If you have any specific needs or concerns, let us know in advance so we can assist you effectively. Your contribution and support means the world to us! <br> &nbsp; </p>
                                    <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                      <span style="font-size:14px">
                                        <span style="color:#800080">
                                          <em>
                                            <strong>A brief overview of the judging schedule:</strong>
                                          </em>
                                        </span>
                                      </span>
                                    </p>
                                    <ul>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">Please aim to arrive between 9:30am and 10:00am</li>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">Upon your arrival, sign in at the check-in desk on the third floor of the Student Union Building <ul>
                                          <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">Execs here can assist with any requests you may have</li>
                                        </ul>
                                      </li>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">After signing in, you are welcome to head over to the organizer lounge rooms at&nbsp; <span style="color:#800080">
                                          <em>
                                            <strong>SUB 2440</strong>
                                          </em>
                                        </span> and <em>
                                          <strong>
                                            <span style="color:#800080">SUB 2420</span>
                                          </strong>
                                        </em>
                                      </li>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">Judging orientation starts at 11:00 am exactly</li>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">We will be providing lunch and breakfast <ul>
                                          <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">Breakfast: assorted muffins and croissants</li>
                                          <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">Lunch: Banh&nbsp;Mi and Italian sliders</li>
                                        </ul>
                                      </li>
                                    </ul>
                                    <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">Feel free to stick around after judging for speed networking and closing ceremonies. We believe your presence will significantly contribute to the success of StormHacks, providing participants with valuable insights and guidance! <br> &nbsp; </p>
                                    <p data-pm-slice="0 0 []" style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                      <span style="color:#4d2465">
                                        <span style="font-size:18px">
                                          <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">
                                            <strong>All About the Magic of StormHacks</strong>
                                          </span>
                                        </span>
                                      </span>
                                      <br> &nbsp;
                                    </p>
                                    <ol>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                        <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                          <span style="color:#8C2FB8">
                                            <em>
                                              <strong>HOW DO I GET TO AND FROM BURNABY CAMPUS?</strong>
                                            </em>
                                          </span>
                                        </p>
                                        <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">SFU is accessible via several forms of public transportation. There will also be <span style="color:#800080">
                                            <em>
                                              <strong>free</strong>
                                            </em>
                                          </span> parking in SFU's&nbsp; <span style="color:#8C2FB8">
                                            <em>
                                              <strong>Central Parkade</strong>
                                            </em>
                                          </span>&nbsp;if you prefer to drive. For detailed directions, please refer to&nbsp; <a href="https://www.translink.ca/" tabindex="-1" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #007C89;font-weight: normal;text-decoration: underline;">
                                            <em>
                                              <strong>TransLink</strong>
                                            </em>
                                          </a>. Driving directions and parking information can be found on the&nbsp; <a href="https://www.sfu.ca/parking.html" tabindex="-1" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #007C89;font-weight: normal;text-decoration: underline;">
                                            <em>
                                              <strong>SFU Parking website</strong>
                                            </em>
                                          </a>. </p>
                                      </li>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                        <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                          <span style="color:#8C2FB8">
                                            <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">
                                              <em>
                                                <strong>HOW DO I NAVIGATE CAMPUS? IS THERE A MAP I CAN USE?</strong>
                                              </em>
                                            </span>
                                          </span>
                                        </p>
                                        <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                          <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">To help you navigate our campus, please refer to the&nbsp; <a href="https://roomfinder.sfu.ca/" tabindex="-1" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #007C89;font-weight: normal;text-decoration: underline;">
                                              <em>
                                                <strong>SFU Room Finder</strong>
                                              </em>
                                            </a>&nbsp;for a detailed map </span>
                                        </p>
                                        <ul>
                                          <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                            <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                              <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Key locations for the event are the Student Union Building&nbsp; <em>
                                                  <strong>(</strong>
                                                </em>
                                                <a href="https://sfss.ca/sub/" tabindex="-1" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #007C89;font-weight: normal;text-decoration: underline;">
                                                  <em>
                                                    <strong>SUB</strong>
                                                  </em>
                                                </a>
                                                <em>
                                                  <strong>)</strong>
                                                </em>&nbsp;and the Applied Sciences&nbsp;Building&nbsp; <em>
                                                  <strong>(</strong>
                                                </em>
                                                <a href="https://www.sfu.ca/fs/campus-maps/directory-of-buildings/applied-sciences-building.html" tabindex="-1" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #007C89;font-weight: normal;text-decoration: underline;">
                                                  <em>
                                                    <strong>ASB</strong>
                                                  </em>
                                                </a>
                                                <em>
                                                  <strong>)</strong>
                                                </em>.&nbsp; </span>
                                            </p>
                                          </li>
                                          <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                            <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                              <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Attached is the run of show for the event; we'll be primarily in the SUB during the day and for the overnight portion will be in the ASB.&nbsp;</span>
                                            </p>
                                          </li>
                                          <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                            <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                              <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">We recommend going home for the night if possible for your own safety and well-being.</span>
                                            </p>
                                          </li>
                                        </ul>
                                      </li>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                        <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                          <span style="color:#8C2FB8">
                                            <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">
                                              <em>
                                                <strong>WHAT IS THE EVENT SCHEDULE?</strong>
                                              </em>
                                            </span>
                                          </span>
                                        </p>
                                        <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                          <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Our event is packed with exciting sessions and activities! The detailed schedule will guide you through each segment to ensure you make the most out of StormHacks 2024. We'll start in the Student Union Building (SUB) and move to the Academic Sciences Building (ASB) for the overnight activities. The full finalized event schedule will be available soon on our&nbsp; <a href="https://stormhacks.com/" tabindex="-1" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #007C89;font-weight: normal;text-decoration: underline;">
                                              <em>
                                                <strong>website</strong>
                                              </em>
                                            </a>&nbsp;and our discord.&nbsp; </span>
                                        </p>
                                      </li>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                        <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                          <span style="color:#8C2FB8">
                                            <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">
                                              <em>
                                                <strong>WHAT DO I DO IN CASE OF AN EMERGENCY?</strong>
                                              </em>
                                            </span>
                                          </span>
                                          <br>
                                          <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">In case of an emergency, please notify the front desk staff of the Student Union Building (Orange Desk, Level 3000), or contact the SFU Campus Security Emergency Line at 778-782-4500. This line is monitored 24/7 for immediate assistance.</span>
                                        </p>
                                      </li>
                                      <li style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                        <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                          <span style="color:#8C2FB8">
                                            <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">
                                              <em>
                                                <strong>ARE THERE ANY RESOURCES FOR SVSPO?</strong>
                                              </em>
                                            </span>
                                          </span>
                                        </p>
                                        <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                          <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">For any support regarding safety and prevention, the SFU Sexual Violence Support &amp; Prevention Office (SVSPO) is available. More information can be found&nbsp; <a href="https://www.sfu.ca/sexual-violence.html" tabindex="-1" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #007C89;font-weight: normal;text-decoration: underline;">
                                              <em>
                                                <strong>here</strong>
                                              </em>
                                            </a>. </span>
                                        </p>
                                      </li>
                                    </ol>
                                    <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">&nbsp;</p>
                                    <p style="text-align: center;margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;">
                                      <span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">We highly recommend saving this email for quick reference during the event. Should you have any questions prior to the event or require further assistance, please feel free to reply to this email.&nbsp;</span>
                                    </p>
                                    <p style="margin: 10px 0;padding: 0;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">
                                      <br>
                                      <br>
                                      <img alt="" data-block-id="22" height="auto" role="presentation" src="https://dim.mcusercontent.com/cs/d3bb8ced202236642d005f468/images/139be53e-e250-fdc1-728b-4a440c973484.jpeg?w=660&dpr=2" width="660" style="border: 0;height: auto !important;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;">
                                      <br>
                                      <br> &nbsp;
                                    </p>
                                    <hr>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top" id="templateFooter" style="background:#FAFAFA none no-repeat center/cover;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;background-color: #FAFAFA;background-image: none;background-repeat: no-repeat;background-position: center;background-size: cover;border-top: 0;border-bottom: 0;padding-top: 9px;padding-bottom: 9px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                      <tbody class="mcnFollowBlockOuter">
                        <tr>
                          <td align="center" valign="top" style="padding: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="mcnFollowBlockInner">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentContainer" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                              <tbody>
                                <tr>
                                  <td align="center" style="padding-left: 9px;padding-right: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;background-color: #4D2465;border: 1px none;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="mcnFollowContent">
                                      <tbody>
                                        <tr>
                                          <td align="center" valign="top" style="padding-top: 9px;padding-right: 9px;padding-left: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                              <tbody>
                                                <tr>
                                                  <td align="center" valign="top" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
  
                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnBlockFloatLeft" style="display: inline;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;float: left;">
                                                      <tbody>
                                                        <tr>
                                                          <td valign="top" style="padding-right: 10px;padding-bottom: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="mcnFollowContentItemContainer">
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                              <tbody>
                                                                <tr>
                                                                  <td align="left" valign="middle" style="padding-top: 5px;padding-right: 10px;padding-bottom: 5px;padding-left: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;float: left;">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td align="center" valign="middle" width="24" class="mcnFollowIconContent" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <a href="https://www.linkedin.com/company/sfu-surge/" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                              <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/light-linkedin-48.png" alt="LinkedIn" style="display: block;border: 0;height: auto;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;" height="24" width="24" class="">
                                                                            </a>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnBlockFloatLeft" style="display: inline;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;float: left;">
                                                      <tbody>
                                                        <tr>
                                                          <td valign="top" style="padding-right: 10px;padding-bottom: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="mcnFollowContentItemContainer">
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                              <tbody>
                                                                <tr>
                                                                  <td align="left" valign="middle" style="padding-top: 5px;padding-right: 10px;padding-bottom: 5px;padding-left: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;float: left;">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td align="center" valign="middle" width="24" class="mcnFollowIconContent" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <a href="https://www.instagram.com/sfusurge/" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                              <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/light-instagram-48.png" alt="Instagram" style="display: block;border: 0;height: auto;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;" height="24" width="24" class="">
                                                                            </a>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnBlockFloatLeft" style="display: inline;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;float: left;">
                                                      <tbody>
                                                        <tr>
                                                          <td valign="top" style="padding-right: 0;padding-bottom: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;" class="mcnFollowContentItemContainer">
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                              <tbody>
                                                                <tr>
                                                                  <td align="left" valign="middle" style="padding-top: 5px;padding-right: 10px;padding-bottom: 5px;padding-left: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;float: left;">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td align="center" valign="middle" width="24" class="mcnFollowIconContent" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                            <a href="https://sfusurge.com/" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                                                              <img src="https://cdn-images.mailchimp.com/icons/social-block-v2/light-link-48.png" alt="Website" style="display: block;border: 0;height: auto;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;" height="24" width="24" class="">
                                                                            </a>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;table-layout: fixed !important;">
                      <tbody class="mcnDividerBlockOuter">
                        <tr>
                          <td class="mcnDividerBlockInner" style="min-width: 100%;padding: 10px 18px 25px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top: 2px solid #EEEEEE;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                              <tbody>
                                <tr>
                                  <td style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                                    <span></span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                      <tbody class="mcnTextBlockOuter">
                        <tr>
                          <td valign="top" class="mcnTextBlockInner" style="padding-top: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width: 100%;min-width: 100%;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;float: left;" width="100%" class="mcnTextContentContainer">
                              <tbody>
                                <tr>
                                  <td valign="top" class="mcnTextContent" style="padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #656565;font-family: Helvetica;font-size: 12px;line-height: 150%;text-align: center;">
                                    <h4 class="null" data-pm-slice="1 1 []" style="text-align: center;display: block;margin: 0;padding: 0;color: #202020;font-family: Helvetica;font-size: 18px;font-style: normal;font-weight: bold;line-height: 125%;letter-spacing: normal;">
                                      <a href="https://mailchi.mp/cb1e40c3f220/youre-invited-to-october-stormhacks-2024-confirm-your-spot-17397288?e=[UNIQID]" tabindex="-1" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #656565;font-weight: normal;text-decoration: underline;">View this email in your browser</a>
                                    </h4>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
  
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </table>
  
            </td>
          </tr>
        </table>
      </center>
      <center>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" id="canspamBarWrapper" style="background-color:#FFFFFF; border-top:1px solid #E5E5E5;">
          <tr>
            <td align="center" valign="top" style="padding-top:20px; padding-bottom:20px;">
              <table border="0" cellpadding="0" cellspacing="0" id="canspamBar">
                <tr>
                  <td align="center" valign="top" style="color:#606060; font-family:Helvetica, Arial, sans-serif; font-size:11px; line-height:150%; padding-right:20px; padding-bottom:5px; padding-left:20px; text-align:center;"> This email was sent to <a href="mailto:&lt;&lt; Test Email Address &gt;&gt;" target="_blank" style="color:#404040 !important;">&lt;&lt; Test Email Address &gt;&gt;</a>
                    <br>
                    <a href="https://gmail.us4.list-manage.com/about?u=33345c9bc17f10bac6afdd0ac&id=736d801cb8&e=[UNIQID]&c=8415c237a6" target="_blank" style="color:#404040 !important;">
                      <em>why did I get this?</em>
                    </a>&nbsp;&nbsp;&nbsp;&nbsp; <a href="https://gmail.us4.list-manage.com/unsubscribe?u=33345c9bc17f10bac6afdd0ac&id=736d801cb8&t=b&e=[UNIQID]&c=8415c237a6" style="color:#404040 !important;">unsubscribe from this list</a>&nbsp;&nbsp;&nbsp;&nbsp; <a href="https://gmail.us4.list-manage.com/profile?u=33345c9bc17f10bac6afdd0ac&id=736d801cb8&e=[UNIQID]&c=8415c237a6" style="color:#404040 !important;">update subscription preferences</a>
                    <br> SFU Surge &middot; 8888 University Drive &middot; Burnaby, BC V5A1S6 &middot; Canada <br>
                    <br>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <style type="text/css">
          @media only screen and (max-width: 480px) {
            table#canspamBar td {
              font-size: 14px !important;
            }
  
            table#canspamBar td a {
              display: block !important;
              margin-top: 10px !important;
            }
          }
        </style>
      </center>
    </body>
  </html>
`;
