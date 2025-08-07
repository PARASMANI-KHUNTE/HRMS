const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');
const connectDB = require('./Database/DbCongif');
const Medicine = require('./Models/Medicine');
const PharmacyInvoice = require('./Models/PharmacyInvoice');
const PharmacyReturn = require('./Models/PharmacyReturn');
const User = require('./Models/User');
const Patient = require('./Models/Patient');
const Hospital = require('./Models/Hospital');

dotenv.config();

const seedData = async () => {
    await connectDB();

    try {
        // Clean up existing data
        await Medicine.deleteMany({});
        await PharmacyInvoice.deleteMany({});
        await PharmacyReturn.deleteMany({});
        await Patient.deleteMany({});
        await User.deleteMany({ role: 'pharmacist' });
        await Hospital.deleteMany({});

        console.log('Cleared existing pharmacy data.');

        // Create a hospital
        const hospital = new Hospital({ name: 'Central City Hospital', address: '123 Health St, Metropolis', phone: faker.phone.number() });
        await hospital.save();

        // Create a pharmacist user
        const pharmacist = new User({
            firstName: 'John',
            lastName: 'Doe',
            phone: faker.phone.number(),
            email: 'pharmacist@example.com',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'pharmacist',
            hospitalId: hospital._id
        });
        await pharmacist.save();

        // Create patients
        const patients = [];
        for (let i = 0; i < 10; i++) {
            const patient = new Patient({
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                phone: faker.phone.number(),
                email: faker.internet.email(),
                gender: faker.helpers.arrayElement(['male', 'female', 'other']),
                dob: faker.date.past({ years: 30 }),
                address: faker.location.streetAddress(),
                hospitalId: hospital._id,
                createdBy: pharmacist._id
            });
            patients.push(patient);
        }
        const createdPatients = await Patient.insertMany(patients);

        // Create medicines
        const medicines = [];
        for (let i = 0; i < 50; i++) {
            const medicine = new Medicine({
                name: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                manufacturer: faker.company.name(),
                unitPrice: faker.commerce.price({ min: 5, max: 200 }),
                stockQuantity: faker.number.int({ min: 50, max: 500 }),
                expiryDate: faker.date.future({ years: 2 }),
                supplier: faker.company.name(),
                category: faker.commerce.department(),
                batchNumber: faker.string.alphanumeric(10).toUpperCase(),
                hospitalId: hospital._id,
                createdBy: pharmacist._id
            });
            medicines.push(medicine);
        }
        const createdMedicines = await Medicine.insertMany(medicines);

        // Create pharmacy invoices
        const invoices = [];
        for (let i = 0; i < 20; i++) {
            const items = [];
            let totalAmount = 0;
            const numItems = faker.number.int({ min: 1, max: 5 });

            for (let j = 0; j < numItems; j++) {
                const medicine = faker.helpers.arrayElement(createdMedicines);
                const quantity = faker.number.int({ min: 1, max: 3 });
                const totalPrice = quantity * medicine.unitPrice;
                items.push({
                    medicineId: medicine._id,
                    name: medicine.name,
                    quantity: quantity,
                    unitPrice: medicine.unitPrice,
                    totalPrice: totalPrice
                });
                totalAmount += totalPrice;
            }

            const invoice = new PharmacyInvoice({
                patient: faker.helpers.arrayElement(createdPatients)._id,
                items: items,
                totalAmount: totalAmount,
                paymentMethod: faker.helpers.arrayElement(['Cash', 'Credit Card']),
                status: 'Paid',
                hospitalId: hospital._id,
                pharmacistId: pharmacist._id
            });
            invoices.push(invoice);
        }
        const createdInvoices = await PharmacyInvoice.insertMany(invoices);

        // Create pharmacy returns
        const returns = [];
        for (let i = 0; i < 5; i++) {
            const originalInvoice = faker.helpers.arrayElement(createdInvoices);
            const itemToReturn = faker.helpers.arrayElement(originalInvoice.items);

            const returnDoc = new PharmacyReturn({
                originalInvoiceId: originalInvoice._id,
                returnedItems: [{
                    medicineId: itemToReturn.medicineId,
                    quantity: 1,
                    refundAmount: itemToReturn.unitPrice
                }],
                totalRefundAmount: itemToReturn.unitPrice,
                reason: faker.lorem.sentence(),
                hospitalId: hospital._id,
                processedBy: pharmacist._id
            });
            returns.push(returnDoc);
        }
        await PharmacyReturn.insertMany(returns);

        console.log('Dummy data for pharmacy module has been successfully added.');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.disconnect();
        console.log('Disconnected from database.');
    }
};

seedData();
