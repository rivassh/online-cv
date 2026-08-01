
jQuery(document).ready(function($) {

    $('.level-bar-inner').css('width', '0');
    
    $(window).on('load', function() {

        $('.level-bar-inner').each(function() {
        
            var itemWidth = $(this).data('level');
            
            $(this).animate({
                width: itemWidth
            }, 800);
            
        });

    });

    // Intro Overlay
    var introOverlay = $('#intro-overlay');
    var smsSection = $('#sms-section');
    var roleSelector = $('#role-selector');
    var roleContent = $('#role-content');

    if (introOverlay.length) {
        $('#intro-close-btn').on('click', function() {
            introOverlay.fadeOut(300, function() {
                // Show SMS section
                smsSection.show();
            });
        });
    }

    // SMS Form Submission
    var smsConfig = {{ site.data.data.raygansms | jsonify }};
    
    if (smsConfig.enabled && smsConfig.endpoint !== 'YOUR_GET_URL_HERE') {
        $('#sms-form').on('submit', function(e) {
            e.preventDefault();
            
            var company = $('#company-name').val();
            var mobile = $('#mobile-number').val();
            
            if (company && mobile) {
                // Replace placeholders in template
                var code = Math.floor(1000 + Math.random() * 9000);
                var message = smsConfig.message_template
                    .replace('{code}', code)
                    .replace('{company}', company);
                
                // Send GET request
                var smsUrl = smsConfig.endpoint
                    .replace('{company}', encodeURIComponent(company))
                    .replace('{mobile}', encodeURIComponent(mobile))
                    .replace('{message}', encodeURIComponent(message));
                
                $('#sms-message').html('<i class="fas fa-spinner fa-spin"></i> Sending SMS...');
                
                fetch(smsUrl)
                    .then(response => {
                        $('#sms-message')
                            .html('<div class="success-message"><i class="fas fa-check-circle"></i> SMS sent successfully! <strong>Code: ' + code + '</strong></div>');
                        
                        // Show role selector
                        setTimeout(function() {
                            smsSection.fadeOut(300, function() {
                                roleSelector.show();
                            });
                        }, 1000);
                    })
                    .catch(error => {
                        console.log('SMS request failed:', error);
                        // Continue anyway if SMS fails
                        $('#sms-message')
                            .html('<div class="sms-fallback"><i class="fas fa-exclamation-triangle"></i> SMS failed, proceeding anyway...</div>');
                        
                        setTimeout(function() {
                            smsSection.fadeOut(300, function() {
                                roleSelector.show();
                            });
                        }, 1500);
                    });
            }
        });
    } else {
        // If SMS endpoint not configured, skip to role selector
        setTimeout(function() {
            smsSection.fadeOut(300, function() {
                roleSelector.show();
            });
        }, 500);
    }

    // Role Selection
    var allRoles = {{ site.data.data.roles.items | jsonify }};
    
    $('.role-card').on('click', function() {
        var roleId = $(this).data('role-id');
        
        // Highlight active role
        $('.role-card').removeClass('active');
        $(this).addClass('active');
        
        // Find selected role data
        var selectedRole = allRoles.find(function(role) {
            return role.id === roleId;
        });
        
        if (selectedRole) {
            updateRoleContent(selectedRole);
            filterExperiences(roleId);
        }
    });

    // Update role content
    function updateRoleContent(role) {
        $('#active-role-symbol').text(role.symbol);
        $('#active-role-title').text(role.title);
        $('#active-role-tagline').text(role.tagline);
        
        var bulletsHtml = '';
        role.bullets.forEach(function(bullet) {
            bulletsHtml += '<li><i class="fas fa-check-circle"></i> ' + bullet + '</li>';
        });
        $('#role-bullets-list').html(bulletsHtml);
        
        roleContent.show();
    }

    // Filter experiences by role
    function filterExperiences(roleId) {
        var allItems = $('#experiences-container .item');
        var filteredItems = [];
        
        allItems.each(function() {
            var tags = $(this).data('tags');
            if (tags && tags.includes(roleId)) {
                filteredItems.push($(this).clone());
            }
        });
        
        var experiencesList = $('#experiences-list');
        experiencesList.empty();
        
        if (filteredItems.length > 0) {
            filteredItems.forEach(function(item) {
                experiencesList.append(item);
            });
            experiencesList.parent().show();
        } else {
            experiencesList.parent().hide();
        }
    }
});
