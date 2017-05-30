import AWS from 'aws-sdk'

const BASE_HOUR = 10

export const handler = (event, context, callback) => {
  console.log(event)
  console.log(context)

  const text = event.queryStringParameters.text
  const command = event.queryStringParameters.command
  const userName = event.queryStringParameters.user_name

  if (!/^\/belate$/.test(command)) {
    callback(null, errorResponse(`Slash command(${command}) is not different.`))

    return
  }

  let operand
  let value

  if (/^([+-]?)([\d.]+)$/.test(text)) {
    operand = RegExp.$1
    value = RegExp.$2
  } else {
    callback(null, errorResponse(`Invalid operand or values was specified(Operand ${operand}, Value: ${value}).`))

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

  const now = new Date()
  const printingValue = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate() + 1}日 ${reportingHour}時頃の出社となります。`
  const mesg = `${userName}は、${printingValue}`

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type:': 'application/json'
    },
    body: JSON.stringify({
      response_type: 'in_channel',
      text: mesg
    })
  }

  sendemail(mesg)
  callback(null, response)
}

const errorResponse = (mesg) => {
  return {
    statusCode: 400,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type:': 'application/json'
    },
    body: JSON.stringify({
      response_type: 'in_channel',
      text: mesg
    })
  }
}

const sendemail = (message) => {
  const sns = new AWS.SNS({
    apiVersion: '2010-03-31',
    region: 'ap-northeast-1'
  })
  sns.publish({
    Message: message,
    Subject: '【勤怠連絡】' + message,
    TopicArn: 'arn:aws:sns:ap-northeast-1:489378379658:belate'
  }, (err, data) => {
    console.error(err, data)
  })
}
