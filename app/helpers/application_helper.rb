module ApplicationHelper

  def app_title
    return 'Windows In Time' if @app == 'windows'
    return 'Tattvas' if @app == 'sun'
    return 'Planetary Hours' if @app == 'moon'
  end

end
