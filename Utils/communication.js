const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports.sendEmail = async (data)=>{
    return new Promise((resolve , reject)=>{
        sgMail.send(data)
        .then(()=>{
            resolve()
        })
        .catch(err=>{
            reject(err)
        })
    })
}