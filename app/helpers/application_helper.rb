module ApplicationHelper

  def app_title
    return 'Overlapping Windows In Time' if @app == 'windows'
    return 'Sun Emanations' if @app == 'sun'
    return 'Planetary Hours' if @app == 'moon'
  end

end
