import dotenv from "dotenv";
import express from "express";
import {Apideck} from '@apideck/node';

dotenv.config();

// Initiate Unify SDK
const apideckSdk = new Apideck({
    basePath: process.env.BASE_URL || 'https://unify.apideck.com',
    apiKey: process.env.API_KEY,
    appId: process.env.APP_ID,
    consumerId: process.env.CONSUMER_ID,
});

console.log("APP_ID: " + process.env.APP_ID);
console.log("CONSUMER_ID: " + process.env.CONSUMER_ID);
console.log("SERVICE_ID_ATS: " + process.env.SERVICE_ID_ATS);
console.log("SERVICE_ID_HRIS: " + process.env.SERVICE_ID_HRIS);

// Set listener
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const port = process.env.port || 7777;

//
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
const day = String(currentDate.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;

app.all("/*", async function (req, res) {
    // Initiate variables
    let employee = null;

    // Build the response
    const msg = {
        message: "Thank you for the message"
    }

    // Process the request
    const webhook_id = req?.body?.payload?.entity_id;

    // Lookup the ATS candidate
    if (webhook_id) {
        try {
            const application = await apideckSdk.ats.applicationsOne({
                id: webhook_id,
                serviceId: process.env.SERVICE_ID_ATS,
            });
            console.log("ATS - Application One called successfully", application.data);
            // Buildup the response
            msg.message = "Application found"
            msg.ats_application = {
                id: application.data.id,
                job_id: application.data?.job_id || '-',
                candidate_id: application.data?.applicant_id || '-',
                status: application.data?.status || '-',
                stage: application.data?.stage.name || '-',
            }

            const candidate_id = application.data?.applicant_id;

            // Only if the status is hired
            if (application.data?.status === 'hired' && candidate_id) {
                const candidate = await apideckSdk.ats.applicantsOne({
                    id: candidate_id,
                    serviceId: process.env.SERVICE_ID_ATS,
                });
                console.log("ATS - applicantsOne called successfully", candidate.data);
                // Set the employee object
                employee = {
                    first_name: candidate.data.first_name,
                    last_name: candidate.data.last_name,
                    title: 'Product Manager',
                    employment_start_date: formattedDate,
                    employee_number: candidate.data?.id,
                    employment_status: "active",
                    employment_role: {
                        type: "employee",
                        sub_type: "full_time"
                    },
                    gender: "female",

                    phone_numbers: candidate.data?.phone_numbers,
                    emails: candidate.data?.emails,
                    addresses: [
                        {
                            type: "primary",
                            city: "Antwerp",
                            country: "BE"
                        }
                    ]
                }

                console.log('employee:', employee)

                // Buildup the response
                msg.message = "Application & Applicant found"
                msg.ats_candidate = {
                    id: candidate.data.id,
                    first_name: candidate.data?.first_name || '-',
                    last_name: candidate.data?.last_name || '-',
                }
            }
        } catch (error) {
            if (error.status === 404) {
                msg.message = "Application or Applicant not found"
            } else {
                msg.message = "An error occurred"
            }
            console.error('ATS error:', error)
        }
    }

    if (employee) {
        try {
            const {data} = await apideckSdk.hris.employeesAdd({
                employee: employee,
                serviceId: process.env.SERVICE_ID_HRIS,
            });
            console.log("HRIS - employeesAdd called successfully", data);
            msg.message = "Application & Applicant found => Employee created"
            msg.hris_employee = {
                id: data?.id,
                url: `https://app.humaans.io/?profile=${data?.id}`
            }
        } catch (error) {
            if (error.status === 404) {
                msg.message = "HRIS endpoint not found"
            } else {
                msg.message = "An error with HRIS push occurred"
            }
            console.error('HRIS error:', error)
        }
    }

    // console.log("-------------- New Request --------------");
    // console.log("Headers:",req.headers);
    // console.log("Body:", req.body);
    res.json(msg);
});

app.listen(port, function () {
    console.log(`Unify app listening at ${port}`);
});
