/** Icon actions column shared by every admin list. */
export const rowActionsField = {
  name: 'rowActions',
  type: 'ui',
  label: 'Actions',
  admin: {
    components: {
      Cell: './src/components/payload/RowActions/index.jsx#RowActionsCell',
    },
  },
}
