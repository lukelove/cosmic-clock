module ApplicationHelper

  def app_title(app = nil)
    app ||=  @app
    return 'Overlaps' if app == 'windows'
    return 'Sun Emanations' if app == 'sun'
    return 'Planetary Hours' if app == 'moon'
  end

end
