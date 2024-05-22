<template>
    <div>
        <button @click="generateInvoice">Generate Invoice</button>
    </div>
</template>

<script>
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
    props: {
        student: Object,
        classesAmount: Number,
    },
    data() {
        return {
            lineY: 20,
            invoiceDetails: {
                companyName: this.currUser?.name || 'Your Company Name',
                companyAddress: this.currUser?.adress || 'Israel',
                invoiceNumber: this.currUser?.invoiceNum + 1|| 1,
                date: new Date().toLocaleDateString(),
            },
        };
    },
    created() {
        // console.log(this.student);
        // console.log(this.classesAmount);
    },
    computed: {
        currUser() {
            return this.$store.getters.loggedinUser
        }
    },
    methods: {
        generateInvoice() {
            const doc = new jsPDF();

            // Add company details
            doc.setFontSize(16);
            doc.text('Invoice #' + this.invoiceDetails.invoiceNumber, 105, this.lineY, null, null, 'center');
            doc.setFontSize(12);
            doc.text(this.invoiceDetails.companyName, 20, this.lineY += 10);
            doc.text(this.invoiceDetails.companyAddress, 20, this.lineY += 5);

            // Add client details
            doc.text('Bill To:', 20, this.lineY += 15);
            doc.text(this.student?.name, 20, this.lineY += 5);
            this.student?.phone ? doc.text('Phone: ' + this.student?.phone, 20, this.lineY += 5) : ''
            // doc.text(this.student.address, 20, 65);

            // Add invoice details
            doc.text('Invoice #: ' + this.invoiceDetails.invoiceNumber, 20, this.lineY += 10);
            doc.text('Date: ' + this.invoiceDetails.date, 20, this.lineY += 5);

            // Add table of items
            const tableColumn = ['Description', 'Quantity', 'Unit Price', 'Total'];
            const tableRows = [['Lessons', this.classesAmount, this.student.price, (this.classesAmount * this.student.price).toFixed(2)]]

            doc.autoTable({
                startY: this.lineY += 15,
                head: [tableColumn],
                body: tableRows,
                margin: { left: 20 }
            });

            // Add total amount
            const finalY = doc.lastAutoTable.finalY; // The y position after the table
            doc.text(
                'Total: ' + (this.classesAmount * this.student.price).toFixed(2),
                20,
                finalY + 10
            );

            // Save the PDF
            doc.save(`invoice #${this.invoiceDetails.invoiceNumber}.pdf`);
            this.lineY = 20
        },
    },
};
</script>