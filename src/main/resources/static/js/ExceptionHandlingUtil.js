( function(thisUtil) {
        thisUtil.getErrorMessage = getErrorMessage;

        let CONTACT_MESSAGE = 'Phone: (857) 453 - 5800<br/>  Email: support@poweradvocate.com';


        function getErrorMessage(timedOut, responseText) {
            if (timedOut) {
                return getTimedOutTitleAndMessage();
            } else {
                return getPlatformErrorTitleAndMessage(responseText);
            }
        }

        function getTimedOutTitleAndMessage() {
            return {
                title : 'Timed Out',
                message : 'The request timed out. Please try refreshing the page. If the problem persists, please contact PowerAdvocate technical support for assistance.<br/>' + CONTACT_MESSAGE
            };
        }

        function getPlatformErrorTitleAndMessage(responseText) {
            let serverErrorDetails;
            let message = 'There was an error processing your request:';
            try {
                let jsonData = JSON.parse(responseText);
                let referenceCode = jsonData.referenceCode;

                if (referenceCode) {
                    let identifier = jsonData.identifier;

                    message += '<br/>  Identifier: ' + identifier + '<br/>  Reference code: ' + referenceCode + '<br/>';
                } else {
                    message += '<br/>' + jsonData.msg;
                }

            } catch (e) {
                console.log(e);
                //In case the response text is not json, it is probably unpolished, therefore probably non-user-friendly and insecure.
                // so just don't do anything here.
            }
            return {
                title : 'Platform Error',
                message : message + '<br/>Please contact PowerAdvocate technical support for assistance.<br/>' + CONTACT_MESSAGE
            };
        }


    }(pa.NamespaceUtil.ns('pa.util.ExceptionHandlingUtil')));