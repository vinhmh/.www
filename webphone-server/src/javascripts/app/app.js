import 'url-search-params-polyfill'

$(() => {

  let isEdgeLEgacy = false;
  let isChromeIOS = false;

  // Detect and prevent Edge Legacy
  if (/Edge/.test(navigator.userAgent)) {
    $('.submit-btn').after("<div><span class='error errorTitle'>Your browser is not compliant!</span><span class='error'>Please use an up-to-date version of Chrome, Firefox or Safari to connect</span></div>");
    isEdgeLEgacy = true;
  }

  // Detect and prevent Chrome on IOS
  if (/CriOS/i.test(navigator.userAgent) && (/iphone|ipod|ipad/i.test(navigator.userAgent))) {
    $('.submit-btn').after("<div><span class='error errorTitle'>Your browser is not compliant!</span><span class='error'>Please use an up-to-date version of Safari to connect</span></div>");
    isChromeIOS = true;
  }

  $('#linkRegular').attr("href", CONFIG.terms ? CONFIG.terms.regularTerms : "https://en.ibridgepeople.com/utilisation")
  $('#linkInterpreter').attr("href", CONFIG.terms ? CONFIG.terms.interpreterTerms : "https://en.ibridgepeople.com/utilisation")
  $('#linkCoordinator').attr("href", CONFIG.terms ? CONFIG.terms.coordinatorTerms : "https://en.ibridgepeople.com/utilisation")

  const meetingHandle = () => {
    let timer = null

    const meetingConferences = async (title, role, callback, { showError } = {}) => {
      const response = await fetch('/meetingConferences', {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ title, role }),
        method: 'POST'
      })
      const conferences = await response.json()
      const $selectItems = $('#cf1, #cf2')
      $selectItems.each((i, select) => {
        $(select)
          .html(`<option value='' selected>${$(select).attr('data-default')}</option>`)
          .trigger('change')
      })
      const $meetingID = $('#meetingID')
      if (!conferences) {
        if (showError) {
          $meetingID.siblings('.error').remove()
          $meetingID.after("<span class='error'>Wrong ID meeting. Please check if well written "
            + 'or if a space caracter has to be removed at the end of the ID due to a copy/paste</span>')
        }
        return
      }

      $meetingID.siblings('.error').remove()
      conferences.forEach(c => $selectItems.append(`<option value='${c.number}'>${c.title}</option>`))
      if (callback) callback(conferences)
    }

    $('#meetingID')
      .on('keyup', function (e, callback) {
        clearTimeout(timer)
        const val = $(this).val()
        const role = $(this).closest('form').find('input[name="role"]').val()
        if (val.trim().length) {
          timer = setTimeout(() => meetingConferences(val, role, callback), 200)
        }
      })
      .on('blur', function (e, callback) {
        clearTimeout(timer)
        const val = $(this).val()
        const role = $(this).closest('form').find('input[name="role"]').val()
        if (val.trim().length) {
          meetingConferences(val, role, callback, { showError: true })
        }
      })
  }

  const validateForm = ($form) => {
    let valid = true
    $form.find('.field-group input').each((i, item) => {
      if (!$(item).val().trim().length) {
        valid = false
        return false
      }
    })

    $form.find('.field-group select').each((i, select) => {
      const value = $(select).find('option:selected').prop('value')
      if (!value) {
        valid = false
        return false
      }
    })

    // Force button to disabled if browser is Edge legacy (Edge without Chromium)
    if (isEdgeLEgacy || isChromeIOS) {
      valid = false;
    }

    $form.find('.submit-btn').prop('disabled', !valid)
    return valid
  }

  $('.check-btn').on('click', async (e) => {
    e.preventDefault()
    window.open(`${CONFIG.webphoneCheckUrl}?noback&lng=en-US`, '_blank', 'width=640,height=800,left=0,top=0')
  })

  $('.webphone-form').on('submit', async function (e) {
    e.preventDefault()
    const $form = $(this)
    const valid = validateForm($form)
    if (!valid) return
    let formData = $form.serialize()
    const query = new URLSearchParams(window.location.search)
    if (query.get('skipBrowserID') === 'true') {
      formData = `${formData}&skipBrowserID=true`
    }

    const redirectWindow = window.open('', '_blank', `width=400,height=${screen.height-((screen.height*15)/100)},left=0}`)
    //Fix to open the audiodesk with the right width from the login page
    redirectWindow.location.href = `${CONFIG.webphoneUrl}?${formData}`
  })

  $('.bbb-btn').on('click', async (e) => {
    e.preventDefault()
    const id = $('.bbb-form').find('#meetingID').val()
    const name = $('.bbb-form').find('#username').val()
    let data = {
      fullName: name,
      meetingID: id,
      password: 456
    }
    if (!name || !id) { return }

    data = $.param(data)
    const redirectWindow = window.open('', '_blank')

    fetch(`/bbb/join?${data}`, {
      credentials: 'same-origin'
    }).then(res => res.text())
      .then(url => {
        redirectWindow.location.href = url
      })
    return false
  })

  $('#interpreter-user-form select').on('change', function () {
    const $this = $(this)
    const val = $this.val()
    const $select = $this.closest('.col').siblings('.col').find('select')
    $select.find('option').prop('disabled', false)
    $select.find(`option[value='${val}']`).prop('disabled', true)
  })

  $('.webphone-form input').on('keyup', function () {
    const $form = $(this).closest('form')
    validateForm($form)
  })

  $('.webphone-form .show-password').on('click', e => {
    const $input = $('.webphone-form .password input')
    const $this = $(e.target)

    if ($input.attr('type') === 'password') {
      $input.attr('type', 'text')
      $this.removeClass('fa-eye-slash').addClass('fa-eye')
    } else {
      $input.attr('type', 'password')
      $this.removeClass('fa-eye').addClass('fa-eye-slash')
    }
  })

  $('.select-box').each((i, selectBox) => {
    const $selectBox = $(selectBox)
    const $select = $selectBox.find('select')
    const $span = $selectBox.find('span')

    let text = $select.find('option:selected').text()
    $span.html(text)

    $select.on('change', (e) => {
      text = $(e.target).find('option:selected').text()
      $span.html(text)
      validateForm($selectBox.closest('form'))
    })
  })

  meetingHandle()
  $('#meetingID').trigger('keyup')
  $('#showcase-user-form #meetingID').trigger('keyup')
  $('#citeo-user-form #meetingID').trigger('keyup')
})
