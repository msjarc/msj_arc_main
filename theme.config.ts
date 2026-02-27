import { defineThemeConfig } from '@utils/defineThemeConfig'
import previewImage from '@assets/img/social-preview-image.png'
import logoImage from '@assets/img/logo_4.svg'

export default defineThemeConfig({
  name: 'MSJ Amateur Radio Club',
  id: 'msjarc-web',
  logo: logoImage,
  seo: {
    title: 'Mission San Jose High School Amateur Radio Club',
    description:
      'The official website for Mission San Jose High School Amateur Radio Club, MSJ ARC W6MSJ.',
    author: 'MSJ ARC Team',
    image: previewImage, // Can also be a string e.g. '/social-preview-image.png',
  },
  colors: {
    primary: '#0a4b39',
    secondary: '#319905',
    neutral: '#b9bec4',
    outline: '#ff4500',
  },
  navigation: {
    darkmode: true,
    items: [
      {
        type: 'link',
        label: 'Home',
        href: '/',
      },
      {
        type: 'link',
        label: 'About Us',
        href: '/about',
      },
      {
        type: 'link',
        label: 'Blog',
        href: '/blog',
      },
      {
        type: 'link',
        label: 'New Ham?',
        href: '/newham',
      },
      {
        label: 'Resources',
        type: 'dropdown',
        items: [
          {
            label: 'Calendars',
            href: '/calendars',
          },
          {
            label: 'Local Clubs',
            href: '/clubs',
          },
          {
            label: 'Local Nets',
            href: '/nets',
          },
          {
            label: 'Local Repeaters',
            href: '/repeaters',
          },
          {
            label: 'Presentations & Reference Materials',
            href: '/materials',
          },
          {
            label: 'Miscellaneous',
            href: '/misc',
          },
          // {
          //   label: '404 page',
          //   href: '/404',
          // },
          // {
          //   label: 'Sitemap',
          //   href: '/sitemap',
          // },
        ],
      },
      {
        type: 'link',
        label: 'Contact',
        href: '/contact',
      },
      {
        type: 'link',
        label: 'Go to our GitHub page, opens in new tab',
        href: 'https://github.com/msjarc/msj_arc_main',
        icon: 'lucide:github',
        external: true,
        excludeFromLauncher: true,
      },
    ],
  },
  socials: [
    {
      label: 'GitHub',
      href: 'https://github.com/msjarc',
      icon: 'lucide:github',
    },
    {
      label: 'Instagram',
      href: 'https://instagram.com/msj_arc',
      icon: 'ion:logo-instagram',
    },
    {
      label: 'QRZ',
      href: 'https://qrz.com/db/w6msj',
      icon: 'ion:globe-outline',
    },
  ],
})
