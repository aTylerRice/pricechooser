import { Mongo } from 'meteor/mongo';

export const StartingCategories = [
  {name:"Comics",slug:"comics",children:[]},
  {name:"Creative", slug: "creative",children:[
    {name:"Photos",slug:"creative-photos",parentSlug:"creative",children:[
      {name:"Abstract",slug:"creative-photos-abstract",parentSlug:"creative-photos",children:[]},
      {name:"Animals",slug:"creative-photos-animals",parentSlug:"creative-photos",children:[]},
      {name:"Architecture", slug:"creative-photos-architecture",parentSlug:"creative-photos",children:[]},
      {name:"Arts & Entertainment", slug:"creative-photos-arts-entertainment",parentSlug:"creative-photos", children:[]},
      {name:"Beauty & Fashion", slug:"creative-photos-beauty-fashion",parentSlug:"creative-photos",children:[]},
      {name:"Business", slug:"creative-photos-business",parentSlug:"creative-photos",children:[]},
      {name:"Education", slug:"creative-photos-education",parentSlug:"creative-photos",children:[]},
      {name:"Food & Drink", slug:"creative-photos-food-drink",parentSlug:"creative-photos",children:[]},
      {name:"Health",slug:"creative-photos-health", parentSlug:"creative-photos",children:[]},
      {name:"Holidays",slug:"creative-photos-holidays",parentSlug:"creative-photos",children:[]},
      {name:"Industrial",slug:"creative-photos-industrial",parentSlug:"creative-photos",children:[]},
      {name:"Nature",slug:"creative-photos-nature",parentSlug:"creative-photos",children:[]},
      {name:"People",slug:"creative-photos-people",parentSlug:"creative-photos",children:[]},
      {name:"Sports",slug:"creative-photos-sports",parentSlug:"creative-photos",children:[]},
      {name:"Technology",slug:"creative-photos-technology",parentSlug:"creative-photos",children:[]},
      {name:"Transportation",slug:"creative-photos-transportation",parentSlug:"creative-photos",children:[]}
    ]},
    {name:"Graphics",slug:"creative-graphics",parentSlug:"creative",children:[
      {name:"Icons",slug:"creative-graphics-icons",parentSlug:"creative-graphics",children:[]},
      {name:"Illustrations",slug:"creative-graphics-illustrations",parentSlug:"creative-graphics",children:[]},
      {name:"Objects",slug:"creative-graphics-objects",parentSlug:"creative-graphics",children:[]},
      {name:"Patterns",slug:"creative-graphics-patterns",parentSlug:"creative-graphics",children:[]},
      {name:"Product Mockups",slug:"creative-graphics-product-markups",parentSlug:"creative-graphics",children:[]},
      {name:"Textures",slug:"creative-graphics-textures",parentSlug:"creative-graphics",children:[]},
      {name:"Web Elements",slug:"creative-graphics-web-elements",parentSlug:"creative-graphics",children:[]}
    ]},
    {name:"Templates",slug:"creative-templates",parentSlug:"creative",children:[
      {name:"Brochures",slug:"creative-templates-brochures",parentSlug:"creative-templates",children:[]},
      {name:"Business Cards",slug:"creative-templates-business-cards",parentSlug:"creative-templates",children:[]},
      {name:"Cards",slug:"creative-templates-cards",parentSlug:"creative-templates",children:[]},
      {name:"Email",slug:"creative-templates-email",parentSlug:"creative-templates",children:[]},
      {name:"Flyers",slug:"creative-templates-flyers",parentSlug:"creative-templates",children:[]},
      {name:"Invitations",slug:"creative-templates-invitations",parentSlug:"creative-templates",children:[]},
      {name:"Logos",slug:"creative-templates-logos",parentSlug:"creative-templates",children:[]},
      {name:"Magazines",slug:"creative-templates-magazines",parentSlug:"creative-templates",children:[]},
      {name:"Presentations",slug:"creative-templates-presentations",parentSlug:"creative-templates",children:[]},
      {name:"Resumes",slug:"creative-templates-resumes",parentSlug:"creative-templates",children:[]},
      {name:"Stationary",slug:"creative-templates-stationary",parentSlug:"creative-templates",children:[]},
      {name:"Websites",slug:"creative-templates-websites",parentSlug:"creative-templates",children:[]}
    ]},
    {name:"Themes",slug:"creative-themes",parentSlug:"creative",children:[
      {name:"Bootstrap",slug:"creative-themes-bootstrap",children:[]},
      {name:"Drupal",slug:"creative-themes-drupal",children:[]},
      {name:"Ghost",slug:"creative-themes-ghost",children:[]},
      {name:"HTML/CSS",slug:"creative-themes-html-css",children:[]},
      {name:"Joomla",slug:"creative-themes-joomla",children:[]},
      {name:"Magento",slug:"creative-themes-magento",children:[]},
      {name:"OpenCart",slug:"creative-themes-opencart",children:[]},
      {name:"Tumblr",slug:"creative-themes-tumblr",children:[]},
      {name:"Wordpress",slug:"creative-themes-wordpress",children:[
        {name:"Plugins",slug:"creative-themes-wordpress-plugins",children:[]},
        {name:"Blog",slug:"creative-themes-wordpress-blog",children:[]},
        {name:"Business",slug:"creative-themes-wordpress-business",children:[]},
        {name:"Commerce",slug:"creative-themes-wordpress-commerce",children:[]},
        {name:"Landing Page",slug:"creative-themes-wordpress-landing-page",children:[]},
        {name:"Magazine",slug:"creative-themes-wordpress-magazine",children:[]},
        {name:"Minimal",slug:"creative-themes-wordpress-minimal",children:[]},
        {name:"Non-Profit",slug:"creative-themes-wordpress-non-profit",children:[]},
        {name:"Photography",slug:"creative-themes-wordpress-photography",children:[]},
        {name:"Portfolio",slug:"creative-themes-wordpress-portfolio",children:[]},
        {name:"Wedding",slug:"creative-themes-wordpress-wedding",children:[]}
      ]}
    ]},
    {name:"Fonts",slug:"creative-fonts",parentSlug:"creative",children:[
      {name:"Blackletter",slug:"creative-fonts-blackletter",children:[]},
      {name:"Display",slug:"creative-fonts-display",children:[]},
      {name:"Non Western",slug:"creative-fonts-non-western",children:[]},
      {name:"Sans Serif",slug:"creative-fonts-sans-serif",children:[]},
      {name:"Script",slug:"creative-fonts-script",children:[]},
      {name:"Serif",slug:"creative-fonts-serif",children:[]},
      {name:"Slab Serif",slug:"creative-fonts-slab-serif",children:[]},
      {name:"Symbols",slug:"creative-fonts-symbols",children:[]}
    ]},
    {name:"Add-Ons",slug:"creative-add-ons",parentSlug:"creative",children:[
      {name:"Actions",slug:"creative-add-ons-actions",children:[]},
      {name:"Brushes",slug:"creative-add-ons-brushes",children:[]},
      {name:"Gradients",slug:"creative-add-ons-gradients",children:[]},
      {name:"Layer Styles",slug:"creative-add-ons-layer-styles",children:[]},
      {name:"Palettes",slug:"creative-add-ons-palettes",children:[]},
      {name:"Plug-ins",slug:"creative-add-ons-plug-ins",children:[]},
      {name:"Shapes",slug:"creative-add-ons-shapes",children:[]}
    ]},
    {name:"3D",slug:"creative-3d",parentSlug:"creative",children:[
      {name:"Animals",slug:"creative-3d-animals",children:[]},
      {name:"Architecture",slug:"creative-3d-architecture",children:[]},
      {name:"Characters",slug:"creative-3d-characters",children:[
        {name:"Fantasy",slug:"creative-3d-characters-fantasy",children:[]},
        {name:"People",slug:"creative-3d-characters-people",children:[]}
      ]},
      {name:"Environment",slug:"creative-3d-environment",children:[
        {name:"Nature",slug:"creative-3d-environment-nature",children:[]},
        {name:"Urban",slug:"creative-3d-environment-urban",children:[]}
      ]},
      {name:"Food",slug:"creative-3d-food",children:[]},
      {name:"Furniture",slug:"creative-3d-furniture",children:[]},
      {name:"Objects",slug:"creative-3d-objects",children:[
        {name:"Appliances",slug:"creative-3d-objects-appliances",children:[]},
        {name:"Electronics",slug:"creative-3d-objects-electronics",children:[]},
        {name:"Tools",slug:"creative-3d-objects-tools",children:[]},
        {name:"Weapons",slug:"creative-3d-objects-weapons",children:[]}
      ]},
      {name:"Textures & Materials",slug:"creative-3d-textures-materials",children:[
        {name:"Man-Made",slug:"creative-3d-textures-materials-man-made",children:[]},
        {name:"Organic",slug:"creative-3d-textures-materials-organic",children:[]}
      ]},
      {name:"Vehicles",slug:"creative-3d-vehicles",children:[]}
    ]},
    {name:"2D Game Assets",slug:"creative-2d-game-assets",parentSlug:"creative",children:[
      {name:"Backgrounds",slug:"creative-2d-game-assets-backgrounds",children:[]},
      {name:"Characters",slug:"creative-2d-game-assets-characters",children:[]},
      {name:"Environments",slug:"creative-2d-game-assets-environments",children:[]},
      {name:"Objects",slug:"creative-2d-game-assets-objects",children:[]},
      {name:"Textures",slug:"creative-2d-game-assets-textures",children:[]},
      {name:"Vegetation",slug:"creative-2d-game-assets-vegetation",children:[]},
      {name:"Vehicles",slug:"creative-2d-game-assets-vehicles",children:[]}
    ]}
  ]},
  {name:"Ebooks",slug:"ebooks",children:[]},
  {name:"PC Games",slug:"pc-games",children:[]},
  {name:"Movies",slug:"movies",children:[]},
  {name:"Music",slug:"music",children:[]}]
export const Categories = new Mongo.Collection('categories');
