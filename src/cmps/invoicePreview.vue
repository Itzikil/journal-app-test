<!-- InvoiceForm.vue -->
<template>
    <div>
      <form @submit.prevent="submitForm">
        <div>
          <label for="studentName">Student Name:</label>
          <input v-model="student.name" id="studentName" type="text" />
        </div>
        <div>
          <label for="studentAddress">Student Address:</label>
          <textarea v-model="student.address" id="studentAddress"></textarea>
        </div>
        <div>
          <label for="studentPhone">Student Phone:</label>
          <input v-model="student.phone" id="studentPhone" type="text" />
        </div>
        <div>
          <label for="invoiceNumber">Invoice Number:</label>
          <input v-model="invoiceDetails.invoiceNumber" id="invoiceNumber" type="text" />
        </div>
        <div>
          <label for="invoiceDate">Date:</label>
          <input v-model="invoiceDetails.date" id="invoiceDate" type="date" />
        </div>
        <div>
          <label for="companyName">Company Name:</label>
          <input v-model="invoiceDetails.companyName" id="companyName" type="text" />
        </div>
        <div>
          <label for="companyAddress">Company Address:</label>
          <textarea v-model="invoiceDetails.companyAddress" id="companyAddress"></textarea>
        </div>
        <div>
          <label for="itemDescription">Item Description:</label>
          <input v-model="newItem.description" id="itemDescription" type="text" />
        </div>
        <div>
          <label for="itemQuantity">Item Quantity:</label>
          <input v-model="newItem.quantity" id="itemQuantity" type="number" />
        </div>
        <div>
          <label for="itemUnitPrice">Item Unit Price:</label>
          <input v-model="newItem.unitPrice" id="itemUnitPrice" type="number" />
        </div>
        <button type="button" @click="addItem">Add Item</button>
        <button type="submit">Preview Invoice</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        student: {
          name: '',
          address: '',
          phone: '',
        },
        invoiceDetails: {
          companyName: '',
          companyAddress: '',
          invoiceNumber: '',
          date: '',
          items: [],
        },
        newItem: {
          description: '',
          quantity: 1,
          unitPrice: 0,
        },
      };
    },
    methods: {
      addItem() {
        if (this.newItem.description && this.newItem.unitPrice > 0) {
          this.invoiceDetails.items.push({ ...this.newItem });
          this.newItem.description = '';
          this.newItem.quantity = 1;
          this.newItem.unitPrice = 0;
        }
      },
      submitForm() {
        this.$emit('submit-invoice', {
          student: this.student,
          invoiceDetails: this.invoiceDetails,
        });
      },
    },
  };
  </script>
  
  <style scoped>
  /* Your styles here */
  </style>
  