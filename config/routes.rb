Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  root to: "astro#index"
  get '/moon', to: "astro#moon"
  get '/sun', to: "astro#sun"
  get '/planets', to: "astro#planets"
  get '/elements', to: "astro#elements"

end
