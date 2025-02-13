export const acceptanceEmailTemplate = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <!-- NAME: 1 COLUMN -->
        <!--[if gte mso 15]>
        <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>*|MC:SUBJECT|*</title>
        
    <style type="text/css">
\t\tp{
\t\t\tmargin:10px 0;
\t\t\tpadding:0;
\t\t}
\t\ttable{
\t\t\tborder-collapse:collapse;
\t\t}
\t\th1,h2,h3,h4,h5,h6{
\t\t\tdisplay:block;
\t\t\tmargin:0;
\t\t\tpadding:0;
\t\t}
\t\timg,a img{
\t\t\tborder:0;
\t\t\theight:auto;
\t\t\toutline:none;
\t\t\ttext-decoration:none;
\t\t}
\t\tbody,#bodyTable,#bodyCell{
\t\t\theight:100%;
\t\t\tmargin:0;
\t\t\tpadding:0;
\t\t\twidth:100%;
\t\t}
\t\t.mcnPreviewText{
\t\t\tdisplay:none !important;
\t\t}
\t\t#outlook a{
\t\t\tpadding:0;
\t\t}
\t\timg{
\t\t\t-ms-interpolation-mode:bicubic;
\t\t}
\t\ttable{
\t\t\tmso-table-lspace:0pt;
\t\t\tmso-table-rspace:0pt;
\t\t}
\t\t.ReadMsgBody{
\t\t\twidth:100%;
\t\t}
\t\t.ExternalClass{
\t\t\twidth:100%;
\t\t}
\t\tp,a,li,td,blockquote{
\t\t\tmso-line-height-rule:exactly;
\t\t}
\t\ta[href^=tel],a[href^=sms]{
\t\t\tcolor:inherit;
\t\t\tcursor:default;
\t\t\ttext-decoration:none;
\t\t}
\t\tp,a,li,td,body,table,blockquote{
\t\t\t-ms-text-size-adjust:100%;
\t\t\t-webkit-text-size-adjust:100%;
\t\t}
\t\t.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{
\t\t\tline-height:100%;
\t\t}
\t\ta[x-apple-data-detectors]{
\t\t\tcolor:inherit !important;
\t\t\ttext-decoration:none !important;
\t\t\tfont-size:inherit !important;
\t\t\tfont-family:inherit !important;
\t\t\tfont-weight:inherit !important;
\t\t\tline-height:inherit !important;
\t\t}
\t\ttable[align=left]{
\t\t\tfloat:left;
\t\t}
\t\ttable[align=right]{
\t\t\tfloat:right;
\t\t}
\t\t#bodyCell{
\t\t\tpadding:10px;
\t\t}
\t\t.templateContainer{
\t\t\tmax-width:600px !important;
\t\t}
\t\ta.mcnButton{
\t\t\tdisplay:block;
\t\t}
\t\t.mcnImage,.mcnRetinaImage{
\t\t\tvertical-align:bottom;
\t\t}
\t\t.mcnTextContent{
\t\t\tword-break:break-word;
\t\t}
\t\t.mcnTextContent img{
\t\t\theight:auto !important;
\t\t}
\t\t.mcnDividerBlock{
\t\t\ttable-layout:fixed !important;
\t\t}
\t/*
\t@tab Page
\t@section Background Style
\t@tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
\t*/
\t\tbody,#bodyTable{
\t\t\t/*@editable*/background-color:#FAFAFA;
\t\t}
\t/*
\t@tab Page
\t@section Background Style
\t@tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
\t*/
\t\t#bodyCell{
\t\t\t/*@editable*/border-top:0;
\t\t}
\t/*
\t@tab Page
\t@section Email Border
\t@tip Set the border for your email.
\t*/
\t\t.templateContainer{
\t\t\t/*@editable*/border:0;
\t\t}
\t/*
\t@tab Page
\t@section Heading 1
\t@tip Set the styling for all first-level headings in your emails. These should be the largest of your headings.
\t@style heading 1
\t*/
\t\th1{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:26px;
\t\t\t/*@editable*/font-style:normal;
\t\t\t/*@editable*/font-weight:bold;
\t\t\t/*@editable*/line-height:125%;
\t\t\t/*@editable*/letter-spacing:normal;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Page
\t@section Heading 2
\t@tip Set the styling for all second-level headings in your emails.
\t@style heading 2
\t*/
\t\th2{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:22px;
\t\t\t/*@editable*/font-style:normal;
\t\t\t/*@editable*/font-weight:bold;
\t\t\t/*@editable*/line-height:125%;
\t\t\t/*@editable*/letter-spacing:normal;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Page
\t@section Heading 3
\t@tip Set the styling for all third-level headings in your emails.
\t@style heading 3
\t*/
\t\th3{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:20px;
\t\t\t/*@editable*/font-style:normal;
\t\t\t/*@editable*/font-weight:bold;
\t\t\t/*@editable*/line-height:125%;
\t\t\t/*@editable*/letter-spacing:normal;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Page
\t@section Heading 4
\t@tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings.
\t@style heading 4
\t*/
\t\th4{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:18px;
\t\t\t/*@editable*/font-style:normal;
\t\t\t/*@editable*/font-weight:bold;
\t\t\t/*@editable*/line-height:125%;
\t\t\t/*@editable*/letter-spacing:normal;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Preheader
\t@section Preheader Style
\t@tip Set the background color and borders for your email's preheader area.
\t*/
\t\t#templatePreheader{
\t\t\t/*@editable*/background-color:#FAFAFA;
\t\t\t/*@editable*/background-image:none;
\t\t\t/*@editable*/background-repeat:no-repeat;
\t\t\t/*@editable*/background-position:center;
\t\t\t/*@editable*/background-size:cover;
\t\t\t/*@editable*/border-top:0;
\t\t\t/*@editable*/border-bottom:0;
\t\t\t/*@editable*/padding-top:9px;
\t\t\t/*@editable*/padding-bottom:9px;
\t\t}
\t/*
\t@tab Preheader
\t@section Preheader Text
\t@tip Set the styling for your email's preheader text. Choose a size and color that is easy to read.
\t*/
\t\t#templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{
\t\t\t/*@editable*/color:#656565;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:12px;
\t\t\t/*@editable*/line-height:150%;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Preheader
\t@section Preheader Link
\t@tip Set the styling for your email's preheader links. Choose a color that helps them stand out from your text.
\t*/
\t\t#templatePreheader .mcnTextContent a,#templatePreheader .mcnTextContent p a{
\t\t\t/*@editable*/color:#656565;
\t\t\t/*@editable*/font-weight:normal;
\t\t\t/*@editable*/text-decoration:underline;
\t\t}
\t/*
\t@tab Header
\t@section Header Style
\t@tip Set the background color and borders for your email's header area.
\t*/
\t\t#templateHeader{
\t\t\t/*@editable*/background-color:#FFFFFF;
\t\t\t/*@editable*/background-image:none;
\t\t\t/*@editable*/background-repeat:no-repeat;
\t\t\t/*@editable*/background-position:center;
\t\t\t/*@editable*/background-size:cover;
\t\t\t/*@editable*/border-top:0;
\t\t\t/*@editable*/border-bottom:0;
\t\t\t/*@editable*/padding-top:9px;
\t\t\t/*@editable*/padding-bottom:0;
\t\t}
\t/*
\t@tab Header
\t@section Header Text
\t@tip Set the styling for your email's header text. Choose a size and color that is easy to read.
\t*/
\t\t#templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:16px;
\t\t\t/*@editable*/line-height:150%;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Header
\t@section Header Link
\t@tip Set the styling for your email's header links. Choose a color that helps them stand out from your text.
\t*/
\t\t#templateHeader .mcnTextContent a,#templateHeader .mcnTextContent p a{
\t\t\t/*@editable*/color:#007C89;
\t\t\t/*@editable*/font-weight:normal;
\t\t\t/*@editable*/text-decoration:underline;
\t\t}
\t/*
\t@tab Body
\t@section Body Style
\t@tip Set the background color and borders for your email's body area.
\t*/
\t\t#templateBody{
\t\t\t/*@editable*/background-color:#FFFFFF;
\t\t\t/*@editable*/background-image:none;
\t\t\t/*@editable*/background-repeat:no-repeat;
\t\t\t/*@editable*/background-position:center;
\t\t\t/*@editable*/background-size:cover;
\t\t\t/*@editable*/border-top:0;
\t\t\t/*@editable*/border-bottom:2px solid #EAEAEA;
\t\t\t/*@editable*/padding-top:0;
\t\t\t/*@editable*/padding-bottom:9px;
\t\t}
\t/*
\t@tab Body
\t@section Body Text
\t@tip Set the styling for your email's body text. Choose a size and color that is easy to read.
\t*/
\t\t#templateBody .mcnTextContent,#templateBody .mcnTextContent p{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:16px;
\t\t\t/*@editable*/line-height:150%;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Body
\t@section Body Link
\t@tip Set the styling for your email's body links. Choose a color that helps them stand out from your text.
\t*/
\t\t#templateBody .mcnTextContent a,#templateBody .mcnTextContent p a{
\t\t\t/*@editable*/color:#007C89;
\t\t\t/*@editable*/font-weight:normal;
\t\t\t/*@editable*/text-decoration:underline;
\t\t}
\t/*
\t@tab Footer
\t@section Footer Style
\t@tip Set the background color and borders for your email's footer area.
\t*/
\t\t#templateFooter{
\t\t\t/*@editable*/background-color:#FAFAFA;
\t\t\t/*@editable*/background-image:none;
\t\t\t/*@editable*/background-repeat:no-repeat;
\t\t\t/*@editable*/background-position:center;
\t\t\t/*@editable*/background-size:cover;
\t\t\t/*@editable*/border-top:0;
\t\t\t/*@editable*/border-bottom:0;
\t\t\t/*@editable*/padding-top:9px;
\t\t\t/*@editable*/padding-bottom:9px;
\t\t}
\t/*
\t@tab Footer
\t@section Footer Text
\t@tip Set the styling for your email's footer text. Choose a size and color that is easy to read.
\t*/
\t\t#templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{
\t\t\t/*@editable*/color:#656565;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:12px;
\t\t\t/*@editable*/line-height:150%;
\t\t\t/*@editable*/text-align:center;
\t\t}
\t/*
\t@tab Footer
\t@section Footer Link
\t@tip Set the styling for your email's footer links. Choose a color that helps them stand out from your text.
\t*/
\t\t#templateFooter .mcnTextContent a,#templateFooter .mcnTextContent p a{
\t\t\t/*@editable*/color:#656565;
\t\t\t/*@editable*/font-weight:normal;
\t\t\t/*@editable*/text-decoration:underline;
\t\t}
\t@media only screen and (min-width:768px){
\t\t.templateContainer{
\t\t\twidth:600px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\tbody,table,td,p,a,li,blockquote{
\t\t\t-webkit-text-size-adjust:none !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\tbody{
\t\t\twidth:100% !important;
\t\t\tmin-width:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnRetinaImage{
\t\t\tmax-width:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImage{
\t\t\twidth:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnCartContainer,.mcnCaptionTopContent,.mcnRecContentContainer,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardRightImageContentContainer{
\t\t\tmax-width:100% !important;
\t\t\twidth:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnBoxedTextContentContainer{
\t\t\tmin-width:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageGroupContent{
\t\t\tpadding:9px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{
\t\t\tpadding-top:9px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageCardTopImageContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{
\t\t\tpadding-top:18px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageCardBottomImageContent{
\t\t\tpadding-bottom:9px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageGroupBlockInner{
\t\t\tpadding-top:0 !important;
\t\t\tpadding-bottom:0 !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageGroupBlockOuter{
\t\t\tpadding-top:9px !important;
\t\t\tpadding-bottom:9px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnTextContent,.mcnBoxedTextContentColumn{
\t\t\tpadding-right:18px !important;
\t\t\tpadding-left:18px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{
\t\t\tpadding-right:18px !important;
\t\t\tpadding-bottom:0 !important;
\t\t\tpadding-left:18px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcpreview-image-uploader{
\t\t\tdisplay:none !important;
\t\t\twidth:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Heading 1
\t@tip Make the first-level headings larger in size for better readability on small screens.
\t*/
\t\th1{
\t\t\t/*@editable*/font-size:22px !important;
\t\t\t/*@editable*/line-height:125% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Heading 2
\t@tip Make the second-level headings larger in size for better readability on small screens.
\t*/
\t\th2{
\t\t\t/*@editable*/font-size:20px !important;
\t\t\t/*@editable*/line-height:125% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Heading 3
\t@tip Make the third-level headings larger in size for better readability on small screens.
\t*/
\t\th3{
\t\t\t/*@editable*/font-size:18px !important;
\t\t\t/*@editable*/line-height:125% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Heading 4
\t@tip Make the fourth-level headings larger in size for better readability on small screens.
\t*/
\t\th4{
\t\t\t/*@editable*/font-size:16px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Boxed Text
\t@tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
\t*/
\t\t.mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{
\t\t\t/*@editable*/font-size:14px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Preheader Visibility
\t@tip Set the visibility of the email's preheader on small screens. You can hide it to save space.
\t*/
\t\t#templatePreheader{
\t\t\t/*@editable*/display:block !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Preheader Text
\t@tip Make the preheader text larger in size for better readability on small screens.
\t*/
\t\t#templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{
\t\t\t/*@editable*/font-size:14px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Header Text
\t@tip Make the header text larger in size for better readability on small screens.
\t*/
\t\t#templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{
\t\t\t/*@editable*/font-size:16px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Body Text
\t@tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
\t*/
\t\t#templateBody .mcnTextContent,#templateBody .mcnTextContent p{
\t\t\t/*@editable*/font-size:16px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Footer Text
\t@tip Make the footer content text larger in size for better readability on small screens.
\t*/
\t\t#templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{
\t\t\t/*@editable*/font-size:14px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}</style></head>
    <body>
        <center>
            <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
                <tr>
                    <td align="center" valign="top" id="bodyCell">
                        <!-- BEGIN TEMPLATE // -->
                        <!--[if (gte mso 9)|(IE)]>
                        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                        <tr>
                        <td align="center" valign="top" width="600" style="width:600px;">
                        <![endif]-->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                            <tr>
                                <td valign="top" id="templatePreheader"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
    <tbody class="mcnTextBlockOuter">
        <tr>
            <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
              \t<!--[if mso]>
\t\t\t\t<table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
\t\t\t\t<tr>
\t\t\t\t<![endif]-->
\t\t\t    
\t\t\t\t<!--[if mso]>
\t\t\t\t<td valign="top" width="600" style="width:600px;">
\t\t\t\t<![endif]-->
\t\t\t\t<!--[if mso]>
\t\t\t\t</td>
\t\t\t\t<![endif]-->
                
\t\t\t\t<!--[if mso]>
\t\t\t\t</tr>
\t\t\t\t</table>
\t\t\t\t<![endif]-->
            </td>
        </tr>
    </tbody>
</table></td>
                            </tr>
                            <tr>
                                <td valign="top" id="templateHeader"></td>
                            </tr>
                            <tr>
                                <td valign="top" id="templateBody"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
    <tbody class="mcnTextBlockOuter">
        <tr>
            <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
              \t<!--[if mso]>
\t\t\t\t<table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
\t\t\t\t<tr>
\t\t\t\t<![endif]-->
\t\t\t    
\t\t\t\t<!--[if mso]>
\t\t\t\t<td valign="top" width="600" style="width:600px;">
\t\t\t\t<![endif]-->
                <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                    <tbody><tr>
                        
                        <td valign="top" class="mcnTextContent" style="padding-top:0; padding-right:18px; padding-bottom:9px; padding-left:18px;">
                        
                            <h1 class="null" data-pm-slice="1 1 []" style="text-align: center;"><img data-file-id="14708117" height="165" src="https://mcusercontent.com/33345c9bc17f10bac6afdd0ac/images/5176a243-4b0f-190e-8898-5c29ca42784c.png" style="border: 0px  ; width: 660px; height: 165px; margin: 0px;" width="660"><br>
<br>
<span style="color:#a87570"><strong><span style="font-size:31px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Welcome to JourneyHacks&nbsp;2025!</span></span></strong></span></h1>

<h1 class="null" style="text-align: center;"><span style="font-size:20px"><span style="color:#a6c47b"><strong><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Important Event Information</span></strong></span></span></h1>

<p style="text-align: center;"><span style="font-size:12px">Some email providers block external images. If you can't see the images in this email, please<br>
enable the setting to download external images or add this sender as a registered email</span></p>

<p style="text-align: left;"><span style="color:#a87570"><span style="font-size:18px"><strong>{{firstName}}, You're a hacker!</strong></span></span><br>
<br>
<span style="font-size:14px"><strong>Stormy was cooking too hard and used some ingredients from our last hackathon&nbsp;in our previous email. Thankfully Sparky cleaned up his mess ~ Here's the correct info so everything runs smoothly on Friday!</strong></span></p>

<p><span style="font-size:14px">We are thrilled to invite you to JourneyHacks 2025 at Simon Fraser University's Burnaby Campus on February 14th. Check-ins begin&nbsp;at 9am and our opening ceremony is at 10am. Our goal is to ensure you have a rewarding and enjoyable experience, so we have compiled a list of essential information to help you prepare for the event. If you have any specific needs or concerns, please reach out to us so we can provide the best support possible during your participation.</span><br>
<br>
<span style="font-size:14px">The following QR code will be used to check yourself into the event, workshops and grab food! Please show it to us when you get to the check in table on Friday. <strong>Please do not share or lose this QR code</strong>, it can also be accessed through the Surge <a href="https://portal.sfusurge.com/login" target="_blank"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif"><span style="color:#b5ca81"><em><strong>Hacker Portal</strong></em></span></span></a>.</span></p>

<img src="cid:qrcode"/>

<p data-pm-slice="0 0 []"><span style="color:#a87570"><span style="font-size:18px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif"><strong>All About the Baking of JourneyHacks</strong></span></span></span></p>
<span style="color:#a87570"><em><strong>1. <span style="font-size:14px">HOW DO I GET TO AND FROM BURNABY CAMPUS?</span></strong></em></span>

<ul>
\t<li><span style="font-size:14px">SFU is accessible via several forms of public transportation. There will also be <span style="color:#b5ca81"><strong><em>self paid</em></strong>&nbsp;</span>parking in SFU's&nbsp;<span style="color:#b5ca81"><em><strong>East Parkade</strong></em></span>&nbsp;if you prefer to drive. For detailed directions, please refer to&nbsp;<a href="https://www.translink.ca/" tabindex="-1" target="_blank"><span style="color:#b5ca81"><em><strong>TransLink</strong></em></span></a>. Driving directions and parking information can be found on the&nbsp;<a href="https://www.sfu.ca/parking.html" tabindex="-1" target="_blank"><span style="color:#b5ca81"><em><strong>SFU Parking website</strong></em></span></a>.</span></li>
\t<li><span style="font-size:14px">Please check-in when you arrive by showing us your QR Code! The check-in desk is in the ASB Hallway.</span></li>
</ul>

<p><span style="color:#a87570"><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif"><em><strong>2. HOW DO I NAVIGATE CAMPUS? IS THERE A MAP I CAN USE?</strong></em></span></span></span></p>

<ul>
\t<li><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">To help you navigate our campus, please refer to the&nbsp;<a href="https://roomfinder.sfu.ca/" tabindex="-1" target="_blank"><span style="color:#b5ca81"><em><strong>SFU Room Finder</strong></em></span></a>&nbsp;for a map</span></span></li>
\t<li><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Key locations for the event are the Applied Science Building&nbsp;<em><strong>(</strong></em><a href="https://www.sfu.ca/fs/campus-maps/directory-of-buildings/applied-sciences-building.html" tabindex="-1" target="_blank"><span style="color:#b5ca81"><em><strong>ASB</strong></em></span></a><em><strong>)</strong></em>&nbsp;</span></span></li>
\t<li><font face="helvetica neue, helvetica, arial, verdana, sans-serif"><span style="font-size:14px">We'll primarily be holding workshops and ceremonies in ASB, but you're allowed to code anywhere on campus</span></font></li>
</ul>

<p><span style="color:#a87570"><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif"><em><strong>3. WHAT MEALS ARE PROVIDED?</strong></em></span></span></span></p>
<span style="font-size:14px">We will provide two meals for the entire event.</span>

<ul>
\t<li><span style="font-size:14px">Lunch: Samosas (chicken, potato/veggie)</span></li>
\t<li><span style="font-size:14px">Dinner: Pizza (pepperoni, hawaiian, vegetarian)</span></li>
</ul>

<p><span style="color:#a87570"><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif"><em><strong>4. WHAT IS THE EVENT SCHEDULE?</strong></em></span></span></span></p>

<ul>
\t<li><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Our event is packed with exciting sessions and activities! The&nbsp;<a href="https://cdn.discordapp.com/attachments/1281742189432406037/1339501355836112929/alternate.png?ex=67aef359&is=67ada1d9&hm=754527b2e9bcbc27aae03d8e5d122835d2d6600011fc6bebd0bcd1c260903049&" target="_blank"><span style="color:#b5ca81"><em><strong>schedule</strong></em></span></a><a href="https://i.ibb.co/jvxFHNbJ/alternate.png"> </a>will guide you through each segment to ensure you make the most out of JourneyHacks 2025. </span></span></li>
</ul>
<span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">The event will be taking place in the Applied Sciences Building (ASB) for the full duration of the event.&nbsp;The full finalized event schedule will be available soon on our&nbsp;<a href="https://portal.sfusurge.com/login" target="_blank"><span style="color:#b5ca81"><em><strong>Hacker Portal</strong></em></span></a><font color="#b5ca81"><strong><em>&nbsp;</em></strong></font>and our discord.</span></span>

<p><span style="color:#a87570"><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif"><em><strong>5. WHAT'S&nbsp;THE DISCORD?</strong></em></span></span></span></p>

<ul>
\t<li><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">You can join the JourneyHacks discord&nbsp;<a href="https://discord.gg/Q5ZTY7YJt4" target="_blank"><span style="color:#b5ca81"><em><strong>here</strong></em></span></a> </span></span></li>
</ul>

<p><em style="color: #A87570;font-family: helvetica neue,helvetica,arial,verdana,sans-serif;font-size: 14px;"><strong>6. FREQUENTLY ASKED QUESTIONS</strong></em></p>

<ul>
\t<li><span style="font-size:14px"><font face="helvetica neue, helvetica, arial, verdana, sans-serif">What if I need to leave early or in the middle of the event?</font></span><br>
\t<span style="font-size:12px">We understand students have classes and other commitments, so the event was designed to be drop-in. Students can leave as early or as late as they'd like and come back later on. We hope to provide a space for students to learn and hone their skills.</span></li>
\t<li><span style="font-size:14px"><font face="helvetica neue, helvetica, arial, verdana, sans-serif">Can my friends join even though they didn't sign up?</font></span><br>
\t<span style="font-size:12px">We'll be accepting walk-ins throughout the day so that students can still attend workshops, side-events and network. Please note that we may close walk-ins depending on the number of attendees.</span></li>
\t<li><span style="font-size:14px">For more FAQ answers, please check out the&nbsp;<strong><em><a href="https://journeyhacks.sfusurge.com/#faq" target="_blank"><span style="color:#b5ca81">JourneyHacks website</span></a>&nbsp;</em></strong>If you have any more questions, please feel free to ask in our Discord servers or on instagram</span></li>
</ul>
<span style="color:#a87570"><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif"><em><strong>7. WHAT HAPPENS IF I CAN'T ATTEND ANYMORE?</strong></em></span></span></span>

<ul>
\t<li><font face="helvetica neue, helvetica, arial, verdana, sans-serif"><span style="font-size:14px">You can withdrawal your acceptance inside of the Hacker Portal.</span></font></li>
</ul>

<p><span style="color:#a87570"><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif"><em><strong>8. WHAT DO I DO IN CASE OF AN EMERGENCY?</strong></em></span></span></span></p>

<ul>
\t<li><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">In case of an emergency, please notify the front desk staff of the Faculty of Applied Science Office&nbsp;(Level 10000 aka 2nd floor), or contact the SFU Campus Security Emergency Line at 778-782-4500. This line is monitored 24/7 for immediate assistance.</span></span></li>
</ul>

<p><span style="color:#a87570"><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif"><em><strong>9. ARE THERE ANY RESOURCES FOR SVSPO?</strong></em></span></span></span></p>

<ul>
\t<li><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">For any support regarding safety and prevention, the SFU Sexual Violence Support &amp; Prevention Office (SVSPO) is available. More information can be found&nbsp;<a href="https://www.sfu.ca/sexual-violence.html" tabindex="-1" target="_blank"><span style="color:#b5ca81"><em><strong>here</strong></em></span></a>.</span></span></li>
</ul>
&nbsp;

<div style="text-align: center;"><span style="font-size:14px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">We highly recommend saving this email for quick reference during the event. Should you have any questions prior to the event or require further assistance, please feel free to reply to this email.&nbsp;</span></span></div>
&nbsp;

<hr>
                        </td>
                    </tr>
                </tbody></table>
\t\t\t\t<!--[if mso]>
\t\t\t\t</td>
\t\t\t\t<![endif]-->
                
\t\t\t\t<!--[if mso]>
\t\t\t\t</tr>
\t\t\t\t</table>
\t\t\t\t<![endif]-->
            </td>
        </tr>
    </tbody>
</table></td>
                            </tr>
                            <tr>
                                <td valign="top" id="templateFooter"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowBlock" style="min-width:100%;">
    <tbody class="mcnFollowBlockOuter">
        <tr>
            <td align="center" valign="top" style="padding:9px" class="mcnFollowBlockInner">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentContainer" style="min-width:100%;">
    <tbody><tr>
        <td align="center" style="padding-left:9px;padding-right:9px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;background-color: #B5CA80;border: 1px none;" class="mcnFollowContent">
                <tbody><tr>
                    <td align="center" valign="top" style="padding-top:9px; padding-right:9px; padding-left:9px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0">
                            <tbody><tr>
                                <td align="center" valign="top">
                                    <!--[if mso]>
                                    <table align="center" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                    <![endif]-->
                                    
                                        <!--[if mso]>
                                        <td align="center" valign="top">
                                        <![endif]-->
                                        
                                        
                                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnBlockFloatLeft" style="display:inline;">
                                                <tbody><tr>
                                                    <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                            <tbody><tr>
                                                                <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                        <tbody><tr>
                                                                            
                                                                                <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                    <a href="https://www.linkedin.com/company/sfu-surge/" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/light-linkedin-48.png" alt="LinkedIn" style="display:block;" height="24" width="24" class=""></a>
                                                                                </td>
                                                                            
                                                                            
                                                                        </tr>
                                                                    </tbody></table>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody></table>
                                        
                                        <!--[if mso]>
                                        </td>
                                        <![endif]-->
                                    
                                        <!--[if mso]>
                                        <td align="center" valign="top">
                                        <![endif]-->
                                        
                                        
                                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnBlockFloatLeft" style="display:inline;">
                                                <tbody><tr>
                                                    <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                            <tbody><tr>
                                                                <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                        <tbody><tr>
                                                                            
                                                                                <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                    <a href="https://www.instagram.com/sfusurge/" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/light-instagram-48.png" alt="Instagram" style="display:block;" height="24" width="24" class=""></a>
                                                                                </td>
                                                                            
                                                                            
                                                                        </tr>
                                                                    </tbody></table>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody></table>
                                        
                                        <!--[if mso]>
                                        </td>
                                        <![endif]-->
                                    
                                        <!--[if mso]>
                                        <td align="center" valign="top">
                                        <![endif]-->
                                        
                                        
                                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnBlockFloatLeft" style="display:inline;">
                                                <tbody><tr>
                                                    <td valign="top" style="padding-right:0; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                            <tbody><tr>
                                                                <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                        <tbody><tr>
                                                                            
                                                                                <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                    <a href="https://sfusurge.com/" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/light-link-48.png" alt="Website" style="display:block;" height="24" width="24" class=""></a>
                                                                                </td>
                                                                            
                                                                            
                                                                        </tr>
                                                                    </tbody></table>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody></table>
                                        
                                        <!--[if mso]>
                                        </td>
                                        <![endif]-->
                                    
                                    <!--[if mso]>
                                    </tr>
                                    </table>
                                    <![endif]-->
                                </td>
                            </tr>
                        </tbody></table>
                    </td>
                </tr>
            </tbody></table>
        </td>
    </tr>
</tbody></table>

            </td>
        </tr>
    </tbody>
</table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;">
    <tbody class="mcnDividerBlockOuter">
        <tr>
            <td class="mcnDividerBlockInner" style="min-width: 100%; padding: 10px 18px 25px;">
                <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top: 2px solid #EEEEEE;">
                    <tbody><tr>
                        <td>
                            <span></span>
                        </td>
                    </tr>
                </tbody></table>
<!--            
                <td class="mcnDividerBlockInner" style="padding: 18px;">
                <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
-->
            </td>
        </tr>
    </tbody>
</table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
    <tbody class="mcnTextBlockOuter">
        <tr>
            <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
              \t<!--[if mso]>
\t\t\t\t<table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
\t\t\t\t<tr>
\t\t\t\t<![endif]-->
\t\t\t    
\t\t\t\t<!--[if mso]>
\t\t\t\t<td valign="top" width="600" style="width:600px;">
\t\t\t\t<![endif]-->
\t\t\t\t<!--[if mso]>
\t\t\t\t</td>
\t\t\t\t<![endif]-->
                
\t\t\t\t<!--[if mso]>
\t\t\t\t</tr>
\t\t\t\t</table>
\t\t\t\t<![endif]-->
            </td>
        </tr>
    </tbody>
</table></td>
                            </tr>
                        </table>
                        <!--[if (gte mso 9)|(IE)]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                        <!-- // END TEMPLATE -->
                    </td>
                </tr>
            </table>
        </center>
    <script type="text/javascript"  src="/tH5EwK/2/y/7b7RLQOfu0gd/E5Lakr8br8tNJi5G/aioUXzp6AQ/ODh4b/2lWERY"></script></body>
</html>
`;

export const welcomeEmailTemplate = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <!-- NAME: 1 COLUMN -->
        <!--[if gte mso 15]>
        <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>*|MC:SUBJECT|*</title>
        
    <style type="text/css">
\t\tp{
\t\t\tmargin:10px 0;
\t\t\tpadding:0;
\t\t}
\t\ttable{
\t\t\tborder-collapse:collapse;
\t\t}
\t\th1,h2,h3,h4,h5,h6{
\t\t\tdisplay:block;
\t\t\tmargin:0;
\t\t\tpadding:0;
\t\t}
\t\timg,a img{
\t\t\tborder:0;
\t\t\theight:auto;
\t\t\toutline:none;
\t\t\ttext-decoration:none;
\t\t}
\t\tbody,#bodyTable,#bodyCell{
\t\t\theight:100%;
\t\t\tmargin:0;
\t\t\tpadding:0;
\t\t\twidth:100%;
\t\t}
\t\t.mcnPreviewText{
\t\t\tdisplay:none !important;
\t\t}
\t\t#outlook a{
\t\t\tpadding:0;
\t\t}
\t\timg{
\t\t\t-ms-interpolation-mode:bicubic;
\t\t}
\t\ttable{
\t\t\tmso-table-lspace:0pt;
\t\t\tmso-table-rspace:0pt;
\t\t}
\t\t.ReadMsgBody{
\t\t\twidth:100%;
\t\t}
\t\t.ExternalClass{
\t\t\twidth:100%;
\t\t}
\t\tp,a,li,td,blockquote{
\t\t\tmso-line-height-rule:exactly;
\t\t}
\t\ta[href^=tel],a[href^=sms]{
\t\t\tcolor:inherit;
\t\t\tcursor:default;
\t\t\ttext-decoration:none;
\t\t}
\t\tp,a,li,td,body,table,blockquote{
\t\t\t-ms-text-size-adjust:100%;
\t\t\t-webkit-text-size-adjust:100%;
\t\t}
\t\t.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{
\t\t\tline-height:100%;
\t\t}
\t\ta[x-apple-data-detectors]{
\t\t\tcolor:inherit !important;
\t\t\ttext-decoration:none !important;
\t\t\tfont-size:inherit !important;
\t\t\tfont-family:inherit !important;
\t\t\tfont-weight:inherit !important;
\t\t\tline-height:inherit !important;
\t\t}
\t\ttable[align=left]{
\t\t\tfloat:left;
\t\t}
\t\ttable[align=right]{
\t\t\tfloat:right;
\t\t}
\t\t#bodyCell{
\t\t\tpadding:10px;
\t\t}
\t\t.templateContainer{
\t\t\tmax-width:600px !important;
\t\t}
\t\ta.mcnButton{
\t\t\tdisplay:block;
\t\t}
\t\t.mcnImage,.mcnRetinaImage{
\t\t\tvertical-align:bottom;
\t\t}
\t\t.mcnTextContent{
\t\t\tword-break:break-word;
\t\t}
\t\t.mcnTextContent img{
\t\t\theight:auto !important;
\t\t}
\t\t.mcnDividerBlock{
\t\t\ttable-layout:fixed !important;
\t\t}
\t/*
\t@tab Page
\t@section Background Style
\t@tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
\t*/
\t\tbody,#bodyTable{
\t\t\t/*@editable*/background-color:#FAFAFA;
\t\t}
\t/*
\t@tab Page
\t@section Background Style
\t@tip Set the background color and top border for your email. You may want to choose colors that match your company's branding.
\t*/
\t\t#bodyCell{
\t\t\t/*@editable*/border-top:0;
\t\t}
\t/*
\t@tab Page
\t@section Email Border
\t@tip Set the border for your email.
\t*/
\t\t.templateContainer{
\t\t\t/*@editable*/border:0;
\t\t}
\t/*
\t@tab Page
\t@section Heading 1
\t@tip Set the styling for all first-level headings in your emails. These should be the largest of your headings.
\t@style heading 1
\t*/
\t\th1{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:26px;
\t\t\t/*@editable*/font-style:normal;
\t\t\t/*@editable*/font-weight:bold;
\t\t\t/*@editable*/line-height:125%;
\t\t\t/*@editable*/letter-spacing:normal;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Page
\t@section Heading 2
\t@tip Set the styling for all second-level headings in your emails.
\t@style heading 2
\t*/
\t\th2{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:22px;
\t\t\t/*@editable*/font-style:normal;
\t\t\t/*@editable*/font-weight:bold;
\t\t\t/*@editable*/line-height:125%;
\t\t\t/*@editable*/letter-spacing:normal;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Page
\t@section Heading 3
\t@tip Set the styling for all third-level headings in your emails.
\t@style heading 3
\t*/
\t\th3{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:20px;
\t\t\t/*@editable*/font-style:normal;
\t\t\t/*@editable*/font-weight:bold;
\t\t\t/*@editable*/line-height:125%;
\t\t\t/*@editable*/letter-spacing:normal;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Page
\t@section Heading 4
\t@tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings.
\t@style heading 4
\t*/
\t\th4{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:18px;
\t\t\t/*@editable*/font-style:normal;
\t\t\t/*@editable*/font-weight:bold;
\t\t\t/*@editable*/line-height:125%;
\t\t\t/*@editable*/letter-spacing:normal;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Preheader
\t@section Preheader Style
\t@tip Set the background color and borders for your email's preheader area.
\t*/
\t\t#templatePreheader{
\t\t\t/*@editable*/background-color:#FAFAFA;
\t\t\t/*@editable*/background-image:none;
\t\t\t/*@editable*/background-repeat:no-repeat;
\t\t\t/*@editable*/background-position:center;
\t\t\t/*@editable*/background-size:cover;
\t\t\t/*@editable*/border-top:0;
\t\t\t/*@editable*/border-bottom:0;
\t\t\t/*@editable*/padding-top:9px;
\t\t\t/*@editable*/padding-bottom:9px;
\t\t}
\t/*
\t@tab Preheader
\t@section Preheader Text
\t@tip Set the styling for your email's preheader text. Choose a size and color that is easy to read.
\t*/
\t\t#templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{
\t\t\t/*@editable*/color:#656565;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:12px;
\t\t\t/*@editable*/line-height:150%;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Preheader
\t@section Preheader Link
\t@tip Set the styling for your email's preheader links. Choose a color that helps them stand out from your text.
\t*/
\t\t#templatePreheader .mcnTextContent a,#templatePreheader .mcnTextContent p a{
\t\t\t/*@editable*/color:#656565;
\t\t\t/*@editable*/font-weight:normal;
\t\t\t/*@editable*/text-decoration:underline;
\t\t}
\t/*
\t@tab Header
\t@section Header Style
\t@tip Set the background color and borders for your email's header area.
\t*/
\t\t#templateHeader{
\t\t\t/*@editable*/background-color:#FFFFFF;
\t\t\t/*@editable*/background-image:none;
\t\t\t/*@editable*/background-repeat:no-repeat;
\t\t\t/*@editable*/background-position:center;
\t\t\t/*@editable*/background-size:cover;
\t\t\t/*@editable*/border-top:0;
\t\t\t/*@editable*/border-bottom:0;
\t\t\t/*@editable*/padding-top:9px;
\t\t\t/*@editable*/padding-bottom:0;
\t\t}
\t/*
\t@tab Header
\t@section Header Text
\t@tip Set the styling for your email's header text. Choose a size and color that is easy to read.
\t*/
\t\t#templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:16px;
\t\t\t/*@editable*/line-height:150%;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Header
\t@section Header Link
\t@tip Set the styling for your email's header links. Choose a color that helps them stand out from your text.
\t*/
\t\t#templateHeader .mcnTextContent a,#templateHeader .mcnTextContent p a{
\t\t\t/*@editable*/color:#007C89;
\t\t\t/*@editable*/font-weight:normal;
\t\t\t/*@editable*/text-decoration:underline;
\t\t}
\t/*
\t@tab Body
\t@section Body Style
\t@tip Set the background color and borders for your email's body area.
\t*/
\t\t#templateBody{
\t\t\t/*@editable*/background-color:#FFFFFF;
\t\t\t/*@editable*/background-image:none;
\t\t\t/*@editable*/background-repeat:no-repeat;
\t\t\t/*@editable*/background-position:center;
\t\t\t/*@editable*/background-size:cover;
\t\t\t/*@editable*/border-top:0;
\t\t\t/*@editable*/border-bottom:2px solid #EAEAEA;
\t\t\t/*@editable*/padding-top:0;
\t\t\t/*@editable*/padding-bottom:9px;
\t\t}
\t/*
\t@tab Body
\t@section Body Text
\t@tip Set the styling for your email's body text. Choose a size and color that is easy to read.
\t*/
\t\t#templateBody .mcnTextContent,#templateBody .mcnTextContent p{
\t\t\t/*@editable*/color:#202020;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:16px;
\t\t\t/*@editable*/line-height:150%;
\t\t\t/*@editable*/text-align:left;
\t\t}
\t/*
\t@tab Body
\t@section Body Link
\t@tip Set the styling for your email's body links. Choose a color that helps them stand out from your text.
\t*/
\t\t#templateBody .mcnTextContent a,#templateBody .mcnTextContent p a{
\t\t\t/*@editable*/color:#007C89;
\t\t\t/*@editable*/font-weight:normal;
\t\t\t/*@editable*/text-decoration:underline;
\t\t}
\t/*
\t@tab Footer
\t@section Footer Style
\t@tip Set the background color and borders for your email's footer area.
\t*/
\t\t#templateFooter{
\t\t\t/*@editable*/background-color:#FAFAFA;
\t\t\t/*@editable*/background-image:none;
\t\t\t/*@editable*/background-repeat:no-repeat;
\t\t\t/*@editable*/background-position:center;
\t\t\t/*@editable*/background-size:cover;
\t\t\t/*@editable*/border-top:0;
\t\t\t/*@editable*/border-bottom:0;
\t\t\t/*@editable*/padding-top:9px;
\t\t\t/*@editable*/padding-bottom:9px;
\t\t}
\t/*
\t@tab Footer
\t@section Footer Text
\t@tip Set the styling for your email's footer text. Choose a size and color that is easy to read.
\t*/
\t\t#templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{
\t\t\t/*@editable*/color:#656565;
\t\t\t/*@editable*/font-family:Helvetica;
\t\t\t/*@editable*/font-size:12px;
\t\t\t/*@editable*/line-height:150%;
\t\t\t/*@editable*/text-align:center;
\t\t}
\t/*
\t@tab Footer
\t@section Footer Link
\t@tip Set the styling for your email's footer links. Choose a color that helps them stand out from your text.
\t*/
\t\t#templateFooter .mcnTextContent a,#templateFooter .mcnTextContent p a{
\t\t\t/*@editable*/color:#656565;
\t\t\t/*@editable*/font-weight:normal;
\t\t\t/*@editable*/text-decoration:underline;
\t\t}
\t@media only screen and (min-width:768px){
\t\t.templateContainer{
\t\t\twidth:600px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\tbody,table,td,p,a,li,blockquote{
\t\t\t-webkit-text-size-adjust:none !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\tbody{
\t\t\twidth:100% !important;
\t\t\tmin-width:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnRetinaImage{
\t\t\tmax-width:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImage{
\t\t\twidth:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnCartContainer,.mcnCaptionTopContent,.mcnRecContentContainer,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardRightImageContentContainer{
\t\t\tmax-width:100% !important;
\t\t\twidth:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnBoxedTextContentContainer{
\t\t\tmin-width:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageGroupContent{
\t\t\tpadding:9px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{
\t\t\tpadding-top:9px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageCardTopImageContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{
\t\t\tpadding-top:18px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageCardBottomImageContent{
\t\t\tpadding-bottom:9px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageGroupBlockInner{
\t\t\tpadding-top:0 !important;
\t\t\tpadding-bottom:0 !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageGroupBlockOuter{
\t\t\tpadding-top:9px !important;
\t\t\tpadding-bottom:9px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnTextContent,.mcnBoxedTextContentColumn{
\t\t\tpadding-right:18px !important;
\t\t\tpadding-left:18px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{
\t\t\tpadding-right:18px !important;
\t\t\tpadding-bottom:0 !important;
\t\t\tpadding-left:18px !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t\t.mcpreview-image-uploader{
\t\t\tdisplay:none !important;
\t\t\twidth:100% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Heading 1
\t@tip Make the first-level headings larger in size for better readability on small screens.
\t*/
\t\th1{
\t\t\t/*@editable*/font-size:22px !important;
\t\t\t/*@editable*/line-height:125% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Heading 2
\t@tip Make the second-level headings larger in size for better readability on small screens.
\t*/
\t\th2{
\t\t\t/*@editable*/font-size:20px !important;
\t\t\t/*@editable*/line-height:125% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Heading 3
\t@tip Make the third-level headings larger in size for better readability on small screens.
\t*/
\t\th3{
\t\t\t/*@editable*/font-size:18px !important;
\t\t\t/*@editable*/line-height:125% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Heading 4
\t@tip Make the fourth-level headings larger in size for better readability on small screens.
\t*/
\t\th4{
\t\t\t/*@editable*/font-size:16px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Boxed Text
\t@tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
\t*/
\t\t.mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{
\t\t\t/*@editable*/font-size:14px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Preheader Visibility
\t@tip Set the visibility of the email's preheader on small screens. You can hide it to save space.
\t*/
\t\t#templatePreheader{
\t\t\t/*@editable*/display:block !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Preheader Text
\t@tip Make the preheader text larger in size for better readability on small screens.
\t*/
\t\t#templatePreheader .mcnTextContent,#templatePreheader .mcnTextContent p{
\t\t\t/*@editable*/font-size:14px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Header Text
\t@tip Make the header text larger in size for better readability on small screens.
\t*/
\t\t#templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{
\t\t\t/*@editable*/font-size:16px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Body Text
\t@tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
\t*/
\t\t#templateBody .mcnTextContent,#templateBody .mcnTextContent p{
\t\t\t/*@editable*/font-size:16px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}\t@media only screen and (max-width: 480px){
\t/*
\t@tab Mobile Styles
\t@section Footer Text
\t@tip Make the footer content text larger in size for better readability on small screens.
\t*/
\t\t#templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{
\t\t\t/*@editable*/font-size:14px !important;
\t\t\t/*@editable*/line-height:150% !important;
\t\t}

}</style></head>
    <body>
        <center>
            <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
                <tr>
                    <td align="center" valign="top" id="bodyCell">
                        <!-- BEGIN TEMPLATE // -->
                        <!--[if (gte mso 9)|(IE)]>
                        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                        <tr>
                        <td align="center" valign="top" width="600" style="width:600px;">
                        <![endif]-->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                            <tr>
                                <td valign="top" id="templatePreheader"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
    <tbody class="mcnTextBlockOuter">
        <tr>
            <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
              \t<!--[if mso]>
\t\t\t\t<table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
\t\t\t\t<tr>
\t\t\t\t<![endif]-->
\t\t\t    
\t\t\t\t<!--[if mso]>
\t\t\t\t<td valign="top" width="600" style="width:600px;">
\t\t\t\t<![endif]-->
\t\t\t\t<!--[if mso]>
\t\t\t\t</td>
\t\t\t\t<![endif]-->
                
\t\t\t\t<!--[if mso]>
\t\t\t\t</tr>
\t\t\t\t</table>
\t\t\t\t<![endif]-->
            </td>
        </tr>
    </tbody>
</table></td>
                            </tr>
                            <tr>
                                <td valign="top" id="templateHeader"></td>
                            </tr>
                            <tr>
                                <td valign="top" id="templateBody"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
    <tbody class="mcnTextBlockOuter">
        <tr>
            <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
              \t<!--[if mso]>
\t\t\t\t<table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
\t\t\t\t<tr>
\t\t\t\t<![endif]-->
\t\t\t    
\t\t\t\t<!--[if mso]>
\t\t\t\t<td valign="top" width="600" style="width:600px;">
\t\t\t\t<![endif]-->
                <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                    <tbody><tr>
                        
                        <td valign="top" class="mcnTextContent" style="padding-top:0; padding-right:18px; padding-bottom:9px; padding-left:18px;">
                        
                            <h1 class="null" data-pm-slice="1 1 []" style="text-align: center;"><img data-file-id="14708117" height="165" src="https://mcusercontent.com/33345c9bc17f10bac6afdd0ac/images/5176a243-4b0f-190e-8898-5c29ca42784c.png" style="border: 0px  ; width: 660px; height: 165px; margin: 0px;" width="660"><br>
<br>
<span style="color:#a87570"><strong><span style="font-size:31px"><span style="font-family:helvetica neue,helvetica,arial,verdana,sans-serif">Your JourneyHacks 2025 Application is in Review 🦦</span></span></strong></span></h1>

<p style="text-align: center;">&nbsp;</p>

<p style="text-align: left;"><span style="color:#a87570"><span style="font-size:18px"><strong>Application received!</strong></span></span><br>
<br>
<span style="font-size:14px">Hello {{firstName}},<br>
<br>
Thank you for submitting your application for JourneyHacks 2025!<br>
<br>
We have received your submission and will notify you within a week after the application deadline with any updates.<br>
<br>
If you would like to withdraw your application, please email us at sfusurgelogistics@gmail.com before the application deadline. Otherwise, there is no further action item on your end.&nbsp;<br>
<br>
We appreciate your commitment to JourneyHacks! Please do not hesitate to reach out to us on our <a href="https://discord.gg/gBGWckz2" target="_blank">discord</a>&nbsp;if you have any questions.<br>
<br>
Warm regards,<br>
SFU Surge</span>&nbsp;</p>
&nbsp;

<hr>
                        </td>
                    </tr>
                </tbody></table>
\t\t\t\t<!--[if mso]>
\t\t\t\t</td>
\t\t\t\t<![endif]-->
                
\t\t\t\t<!--[if mso]>
\t\t\t\t</tr>
\t\t\t\t</table>
\t\t\t\t<![endif]-->
            </td>
        </tr>
    </tbody>
</table></td>
                            </tr>
                            <tr>
                                <td valign="top" id="templateFooter"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowBlock" style="min-width:100%;">
    <tbody class="mcnFollowBlockOuter">
        <tr>
            <td align="center" valign="top" style="padding:9px" class="mcnFollowBlockInner">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentContainer" style="min-width:100%;">
    <tbody><tr>
        <td align="center" style="padding-left:9px;padding-right:9px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;background-color: #B5CA80;border: 1px none;" class="mcnFollowContent">
                <tbody><tr>
                    <td align="center" valign="top" style="padding-top:9px; padding-right:9px; padding-left:9px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0">
                            <tbody><tr>
                                <td align="center" valign="top">
                                    <!--[if mso]>
                                    <table align="center" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                    <![endif]-->
                                    
                                        <!--[if mso]>
                                        <td align="center" valign="top">
                                        <![endif]-->
                                        
                                        
                                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnBlockFloatLeft" style="display:inline;">
                                                <tbody><tr>
                                                    <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                            <tbody><tr>
                                                                <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                        <tbody><tr>
                                                                            
                                                                                <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                    <a href="https://www.linkedin.com/company/sfu-surge/" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/light-linkedin-48.png" alt="LinkedIn" style="display:block;" height="24" width="24" class=""></a>
                                                                                </td>
                                                                            
                                                                            
                                                                        </tr>
                                                                    </tbody></table>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody></table>
                                        
                                        <!--[if mso]>
                                        </td>
                                        <![endif]-->
                                    
                                        <!--[if mso]>
                                        <td align="center" valign="top">
                                        <![endif]-->
                                        
                                        
                                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnBlockFloatLeft" style="display:inline;">
                                                <tbody><tr>
                                                    <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                            <tbody><tr>
                                                                <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                        <tbody><tr>
                                                                            
                                                                                <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                    <a href="https://www.instagram.com/sfusurge/" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/light-instagram-48.png" alt="Instagram" style="display:block;" height="24" width="24" class=""></a>
                                                                                </td>
                                                                            
                                                                            
                                                                        </tr>
                                                                    </tbody></table>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody></table>
                                        
                                        <!--[if mso]>
                                        </td>
                                        <![endif]-->
                                    
                                        <!--[if mso]>
                                        <td align="center" valign="top">
                                        <![endif]-->
                                        
                                        
                                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnBlockFloatLeft" style="display:inline;">
                                                <tbody><tr>
                                                    <td valign="top" style="padding-right:0; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                            <tbody><tr>
                                                                <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                        <tbody><tr>
                                                                            
                                                                                <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                    <a href="https://sfusurge.com/" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/light-link-48.png" alt="Website" style="display:block;" height="24" width="24" class=""></a>
                                                                                </td>
                                                                            
                                                                            
                                                                        </tr>
                                                                    </tbody></table>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody></table>
                                        
                                        <!--[if mso]>
                                        </td>
                                        <![endif]-->
                                    
                                    <!--[if mso]>
                                    </tr>
                                    </table>
                                    <![endif]-->
                                </td>
                            </tr>
                        </tbody></table>
                    </td>
                </tr>
            </tbody></table>
        </td>
    </tr>
</tbody></table>

            </td>
        </tr>
    </tbody>
</table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;">
    <tbody class="mcnDividerBlockOuter">
        <tr>
            <td class="mcnDividerBlockInner" style="min-width: 100%; padding: 10px 18px 25px;">
                <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top: 2px solid #EEEEEE;">
                    <tbody><tr>
                        <td>
                            <span></span>
                        </td>
                    </tr>
                </tbody></table>
<!--            
                <td class="mcnDividerBlockInner" style="padding: 18px;">
                <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
-->
            </td>
        </tr>
    </tbody>
</table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
    <tbody class="mcnTextBlockOuter">
        <tr>
            <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
              \t<!--[if mso]>
\t\t\t\t<table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
\t\t\t\t<tr>
\t\t\t\t<![endif]-->
\t\t\t    
\t\t\t\t<!--[if mso]>
\t\t\t\t<td valign="top" width="600" style="width:600px;">
\t\t\t\t<![endif]-->
\t\t\t\t<!--[if mso]>
\t\t\t\t</td>
\t\t\t\t<![endif]-->
                
\t\t\t\t<!--[if mso]>
\t\t\t\t</tr>
\t\t\t\t</table>
\t\t\t\t<![endif]-->
            </td>
        </tr>
    </tbody>
</table></td>
                            </tr>
                        </table>
                        <!--[if (gte mso 9)|(IE)]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                        <!-- // END TEMPLATE -->
                    </td>
                </tr>
            </table>
        </center>
    <script type="text/javascript"  src="/Tzb1aYNXs7/TZzkQK1MA6/pOiYJDXrLbXfOO/MHNfInI/P3h/WCnYWX00"></script></body>
</html>
`;
