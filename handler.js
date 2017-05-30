import AWS from 'aws-sdk'

const BASE_HOUR = 10

export const handler = (event, context, callback) => {
  const text = event.queryStringParameters.text
  const command = event.queryStringParameters.command
  const userName = event.queryStringParameters.user_name

  if (!/^\/belate$/.test(command)) {
    errorResponse(callback, `Slash command(${command}) is not different.`)

    return
  }

  let operand
  let value

  if (/^([+-]?)([\d.]+)$/.test(text)) {
    operand = RegExp.$1
    value = RegExp.$2
  } else {
    errorResponse(callback, `Invalid operand or values was specified(Operand ${operand}, Value: ${value}).`)

    return
  }

  let reportingHour = BASE_HOUR

  switch (operand) {
    case '+':
      reportingHour = Number(BASE_HOUR) + parseFloat(value)
      break
    case '-':
      reportingHour = Number(BASE_HOUR) - parseFloat(value)
      break
    default:
      break
  }

  const today = Date.now() - ((new Date()).getHours() * 3600 * 1000)
  const reportingDate = new Date(today + (3600 * 1000 * reportingHour))
  const reportingValue = `${reportingDate.getFullYear()}年${reportingDate.getMonth() + 1}月${reportingDate.getDate()}日 ${reportingDate.getHours()}時頃の出社となります。`
  const mesg = `【勤怠連絡】 ${userName}は、${reportingValue}`

  // sendemailBySNS(callback, mesg)
  sendmailBySES(callback, mesg)
}

const successResponse = (callback, mesg) => {
  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type:': 'application/json'
    },
    body: JSON.stringify({
      response_type: 'in_channel',
      text: mesg
    })
  })
}

const errorResponse = (callback, mesg) => {
  console.error(mesg)
  callback(null, {
    statusCode: 400,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type:': 'application/json'
    },
    body: JSON.stringify({
      text: mesg
    })
  })
}

const sendemailBySNS = (callback, mesg) => {
  const sns = new AWS.SNS({
    apiVersion: '2010-03-31',
    region: 'ap-northeast-1'
  })
  sns.publish({
    Message: 'Title Only',
    Subject: mesg,
    TopicArn: 'arn:aws:sns:ap-northeast-1:489378379658:belate'
  }, (error, data) => {
    if (error) {
      errorResponse(callback, error)
    } else {
      successResponse(callback, mesg)
    }
  })
}

const sendmailBySES = (callback, mesg) => {
  const ses = new AWS.SES({
    region: 'us-east-1'
  })
  ses.sendEmail({
    Destination: {
      ToAddresses: [ 'hideki@inoue-kobo.com' ]
    },
    Message: {
      Subject: {
        Data: mesg,
        Charset: 'utf-8'
      },
      Body: {
        Text: {
          Data: 'Title Only',
          Charset: 'utf-8'
        }
      }
    },
    Source: 'hideki@inoue-kobo.com'
  }, (error, data) => {
    if (error) {
      errorResponse(callback, error)
    } else {
      successResponse(callback, mesg)
    }
  })
}
