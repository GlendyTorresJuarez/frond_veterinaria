import { canNavigate } from '@layouts/plugins/casl'
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import { isUserLoggedIn } from './utils'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: to => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')
        const userRole = (userData && userData.rol) ? userData.rol : null

        //si el usuario es diferente de nulo y es manage puede acceder al sistema
        if (userRole !== null) {
          return { name: 'index' }
        }

        return { name: 'login', query: to.query }
      }
    },
    ...setupLayouts(routes),
  ],
})


// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach(to => {
  const isLoggedIn = isUserLoggedIn()

  if (!canNavigate(to)) {
    if (!isLoggedIn) {
      return { name: 'login' }
    }
    return { name: 'not-authorized' }
  }
})
export default router
