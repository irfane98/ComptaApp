<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import type { Invoice } from '../stores/invoices'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'

const props = defineProps<{
  invoice: Invoice
}>()

const invoiceRef = ref<HTMLElement>()

const generatePDF = async () => {
  if (!invoiceRef.value) return
  
  const canvas = await html2canvas(invoiceRef.value, {
    scale: 2,
    logging: false,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  
  const imgProps = pdf.getImageProperties(imgData)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`facture-${props.invoice.number}.pdf`)
}

const formatDate = (date: string) => {
  return format(new Date(date), 'dd MMMM yyyy', { locale: fr })
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: props.invoice.currency })
}

const getStatusColor = (status: Invoice['status']) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'sent': return 'bg-blue-100 text-blue-800'
    case 'paid': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
  }
}

const getStatusLabel = (status: Invoice['status']) => {
  switch (status) {
    case 'draft': return 'Brouillon'
    case 'sent': return 'Envoyée'
    case 'paid': return 'Payée'
    case 'cancelled': return 'Annulée'
  }
}

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case 'bank_transfer': return 'Virement bancaire'
    case 'cash': return 'Espèces'
    case 'check': return 'Chèque'
    default: return method
  }
}

defineExpose({ generatePDF })
</script>

<template>
  <div ref="invoiceRef" class="bg-white p-8 max-w-4xl mx-auto">
    <!-- En-tête -->
    <div class="flex justify-between items-start mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ invoice.type === 'sale' ? 'Facture de vente' : 'Facture d\'achat' }}
        </h1>
        <div class="flex items-center space-x-3 mt-2">
          <p class="text-gray-600">N° {{ invoice.number }}</p>
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="getStatusColor(invoice.status)"
          >
            {{ getStatusLabel(invoice.status) }}
          </span>
        </div>
        <p v-if="invoice.reference" class="text-gray-600 mt-1">
          Réf: {{ invoice.reference }}
        </p>
      </div>
      
      <div class="text-right">
        <img src="/logo.png" alt="Logo" class="h-16 mb-2">
        <p class="font-medium">Votre Entreprise SARL</p>
        <p class="text-sm text-gray-600">
          123 rue des Entreprises<br>
          75000 Paris, France<br>
          contact@entreprise.fr<br>
          SIRET: 123 456 789 00001<br>
          TVA: FR12345678901
        </p>
      </div>
    </div>
    
    <!-- Informations client et dates -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <h2 class="text-lg font-medium mb-2">Client</h2>
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="font-medium">{{ invoice.client.name }}</p>
          <p v-if="invoice.client.siret" class="text-gray-600">SIRET: {{ invoice.client.siret }}</p>
          <p v-if="invoice.client.vatNumber" class="text-gray-600">TVA: {{ invoice.client.vatNumber }}</p>
          <p class="whitespace-pre-line text-gray-600 mt-2">{{ invoice.client.address }}</p>
          <div class="mt-2 text-gray-600">
            <p>{{ invoice.client.email }}</p>
            <p v-if="invoice.client.phone">{{ invoice.client.phone }}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h2 class="text-lg font-medium mb-2">Détails</h2>
        <div class="p-4 bg-gray-50 rounded-lg space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Date d'émission:</span>
            <span>{{ formatDate(invoice.date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Date d'échéance:</span>
            <span>{{ formatDate(invoice.dueDate) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Mode de paiement:</span>
            <span>{{ getPaymentMethodLabel(invoice.paymentMethod) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Conditions:</span>
            <span>{{ invoice.paymentTerms }} jours</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Articles -->
    <table class="w-full mb-8">
      <thead>
        <tr class="border-b-2 border-gray-200">
          <th class="py-2 text-left">Description</th>
          <th class="py-2 text-right">Quantité</th>
          <th class="py-2 text-center">Unité</th>
          <th class="py-2 text-right">Prix unitaire</th>
          <th class="py-2 text-right">TVA</th>
          <th class="py-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in invoice.items" :key="item.id" class="border-b border-gray-100">
          <td class="py-3">{{ item.description }}</td>
          <td class="py-3 text-right">{{ item.quantity }}</td>
          <td class="py-3 text-center">{{ item.unit || 'unité' }}</td>
          <td class="py-3 text-right">{{ formatAmount(item.unitPrice) }}</td>
          <td class="py-3 text-right">{{ item.taxRate }}%</td>
          <td class="py-3 text-right">{{ formatAmount(item.total) }}</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Totaux -->
    <div class="w-64 ml-auto space-y-2">
      <div class="flex justify-between">
        <span class="text-gray-600">Sous-total:</span>
        <span>{{ formatAmount(invoice.subtotal) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">TVA:</span>
        <span>{{ formatAmount(invoice.taxTotal) }}</span>
      </div>
      <div class="flex justify-between pt-2 border-t-2 border-gray-200 font-medium">
        <span>Total:</span>
        <span>{{ formatAmount(invoice.total) }}</span>
      </div>
    </div>
    
    <!-- Notes -->
    <div v-if="invoice.notes" class="mt-8 p-4 bg-gray-50 rounded-lg">
      <h2 class="text-lg font-medium mb-2">Notes</h2>
      <p class="text-gray-600 whitespace-pre-line">{{ invoice.notes }}</p>
    </div>
    
    <!-- Pied de page -->
    <div class="mt-8 pt-8 border-t text-sm text-gray-500">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <h3 class="font-medium mb-1">Coordonnées bancaires</h3>
          <p>IBAN: FR76 1234 5678 9012 3456 7890 123</p>
          <p>BIC: ABCDEFGHIJK</p>
        </div>
        <div>
          <h3 class="font-medium mb-1">Contact</h3>
          <p>Tél: +33 1 23 45 67 89</p>
          <p>Email: contact@entreprise.fr</p>
        </div>
        <div>
          <h3 class="font-medium mb-1">Mentions légales</h3>
          <p>SARL au capital de 10 000€</p>
          <p>RCS Paris B 123 456 789</p>
        </div>
      </div>
      
      <p class="mt-4 text-center">
        En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée,
        à laquelle s'ajoutera une indemnité forfaitaire pour frais de recouvrement de 40€.
      </p>
    </div>
  </div>
</template>