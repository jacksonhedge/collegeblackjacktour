import{r as c,j as e,c as E,s as T,v as $,u as A,y as z,n as w,A as P,aA as B,ab as F,B as k,x as M,D as q,U as D,G as R,S as G,m as I,M as W}from"./main-Bt21LLck.js";import{M as j}from"./mail-Dke56W7c.js";import{C as H}from"./circle-check-big-PbtGHC_l.js";import{S as Y}from"./save-CdP6NBoK.js";import{M as S}from"./message-square-Wx_HBuIi.js";import{C as L}from"./clock-Bf45bXE_.js";const O=({userEmail:m="jacksonfitzgerald25@gmail.com"})=>{const[a,s]=c.useState(!1),[n,x]=c.useState(null),[f,l]=c.useState(""),u=async()=>{s(!0),x(null),l("");try{const r=new Date().toLocaleString(),{data:y,error:g}=await T.functions.invoke("send-notification",{body:{to:m,subject:`🎉 Bankroll Test Email - ${r}`,html:`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, Arial, sans-serif; background: #f5f5f5;">
              <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; text-align: center;">
                  <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                    💰
                  </div>
                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600;">Bankroll Email Test</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your notifications are working!</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 48px 32px;">
                  <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px;">Hi there! 👋</h2>
                  
                  <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    This is a test email from your Bankroll notification system. If you're seeing this, everything is working perfectly!
                  </p>
                  
                  <!-- Success Box -->
                  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 24px; margin: 32px 0;">
                    <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 18px; display: flex; align-items: center;">
                      ✅ System Status: Operational
                    </h3>
                    <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.8;">
                      <li>Email delivery: Working</li>
                      <li>Supabase Edge Functions: Active</li>
                      <li>SendGrid integration: Connected</li>
                      <li>Notification system: Ready</li>
                    </ul>
                  </div>
                  
                  <!-- What You Can Receive -->
                  <div style="margin: 32px 0;">
                    <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 18px;">📬 Notifications You'll Receive:</h3>
                    <div style="display: grid; gap: 12px;">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: #e0e7ff; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                          💸
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #1a1a1a;">Transaction Alerts</div>
                          <div style="font-size: 14px; color: #6b7280;">Deposits, withdrawals, and transfers</div>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: #fef3c7; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                          👥
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #1a1a1a;">Group Updates</div>
                          <div style="font-size: 14px; color: #6b7280;">Invites and group activity</div>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: #ecfccb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                          🎁
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #1a1a1a;">Promotions</div>
                          <div style="font-size: 14px; color: #6b7280;">Special offers and bonuses</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Technical Details -->
                  <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 32px 0;">
                    <h4 style="color: #4b5563; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Technical Details</h4>
                    <div style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                      <div><strong>Sent to:</strong> ${m}</div>
                      <div><strong>Time:</strong> ${r}</div>
                      <div><strong>Provider:</strong> Supabase Edge Functions + SendGrid</div>
                      <div><strong>From:</strong> noreply@bankroll.live</div>
                    </div>
                  </div>
                  
                  <!-- CTA -->
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="https://bankroll.live/settings/notifications" 
                       style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Manage Notifications
                    </a>
                  </div>
                  
                  <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 32px 0 0 0;">
                    You're receiving this because you requested a test email from your Bankroll notification settings.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                    © 2024 Bankroll. All rights reserved.
                  </p>
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    Powered by Supabase Edge Functions
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,text:`Bankroll Email Test

Hi there!

This is a test email from your Bankroll notification system. If you're seeing this, everything is working perfectly!

✅ System Status: Operational
- Email delivery: Working
- Supabase Edge Functions: Active
- SendGrid integration: Connected
- Notification system: Ready

Sent to: ${m}
Time: ${r}

Manage your notifications: https://bankroll.live/settings/notifications

© 2024 Bankroll. All rights reserved.`}});if(g)throw g;x("success"),l(`Test email sent to ${m}!`),setTimeout(()=>{x(null),l("")},5e3)}catch(r){console.error("Error sending test email:",r),x("error"),l(r.message||"Failed to send test email"),setTimeout(()=>{x(null),l("")},5e3)}finally{s(!1)}};return e.jsxs("div",{className:"bg-white rounded-xl p-6 shadow-sm border border-gray-100",children:[e.jsx("div",{className:"flex items-center justify-between mb-4",children:e.jsxs("div",{children:[e.jsxs("h3",{className:"text-lg font-semibold text-gray-900 flex items-center gap-2",children:[e.jsx(j,{className:"w-5 h-5 text-purple-600"}),"Test Email Delivery"]}),e.jsx("p",{className:"text-sm text-gray-600 mt-1",children:"Send a test email to verify your notification system is working"})]})}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"bg-gray-50 rounded-lg p-4",children:e.jsxs("p",{className:"text-sm text-gray-600",children:[e.jsx("span",{className:"font-medium",children:"Test email will be sent to:"}),e.jsx("br",{}),e.jsx("span",{className:"text-gray-900 font-mono",children:m})]})}),e.jsx("button",{onClick:u,disabled:a,className:`
            w-full py-3 px-4 rounded-lg font-medium 
            flex items-center justify-center gap-2
            transition-all duration-200
            ${a?"bg-gray-100 text-gray-400 cursor-not-allowed":"bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md"}
          `,children:a?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"animate-spin rounded-full h-5 w-5 border-b-2 border-white"}),"Sending..."]}):e.jsxs(e.Fragment,{children:[e.jsx(E,{className:"w-5 h-5"}),"Send Test Email"]})}),n&&e.jsxs("div",{className:`
            p-4 rounded-lg flex items-start gap-3
            ${n==="success"?"bg-green-50 text-green-800":"bg-red-50 text-red-800"}
          `,children:[n==="success"?e.jsx(H,{className:"w-5 h-5 mt-0.5 flex-shrink-0"}):e.jsx($,{className:"w-5 h-5 mt-0.5 flex-shrink-0"}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium",children:n==="success"?"Success!":"Error"}),e.jsx("p",{className:"text-sm mt-1",children:f})]})]}),e.jsxs("div",{className:"text-xs text-gray-500 space-y-1",children:[e.jsx("p",{children:"• Emails are sent via Supabase Edge Functions"}),e.jsx("p",{children:"• Check your spam folder if you don't see it"}),e.jsx("p",{children:'• Sender will show as "noreply@bankroll.live"'})]})]})]})},Z=()=>{const m=A(),{currentUser:a}=z(),[s,n]=c.useState(null),[x,f]=c.useState(!0),[l,u]=c.useState(!1),[r,y]=c.useState(!1);c.useEffect(()=>{a&&g()},[a]);const g=async()=>{try{const i=await w.getPreferences(a.id);n(i)}catch(i){console.error("Error fetching preferences:",i)}finally{f(!1)}},o=i=>{n(t=>({...t,[i]:!t[i]}))},_=async()=>{u(!0);try{await w.updatePreferences(a.id,s),y(!0),setTimeout(()=>y(!1),3e3)}catch(i){console.error("Error saving preferences:",i),alert("Failed to save preferences. Please try again.")}finally{u(!1)}};if(x)return e.jsx("div",{className:"flex items-center justify-center h-screen",children:e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"})});const C=[{id:"transactions",name:"Transactions",description:"Money sent, received, deposits, and withdrawals",icon:e.jsx(q,{className:"w-5 h-5"}),color:"text-green-600 bg-green-100",subcategories:[{id:"deposit_initiated",name:"Deposit Initiated"},{id:"deposit_completed",name:"Deposit Completed"},{id:"withdrawal_initiated",name:"Withdrawal Initiated"},{id:"withdrawal_completed",name:"Withdrawal Completed"},{id:"money_received",name:"Money Received"},{id:"money_sent",name:"Money Sent"}]},{id:"social",name:"Social",description:"Friend requests, group invites, and social activity",icon:e.jsx(D,{className:"w-5 h-5"}),color:"text-blue-600 bg-blue-100",subcategories:[{id:"group_invite",name:"Group Invitations"},{id:"friend_request",name:"Friend Requests"},{id:"group_activity",name:"Group Activity"}]},{id:"rewards",name:"Rewards & Bonuses",description:"Daily spins, jackpots, and bonus opportunities",icon:e.jsx(R,{className:"w-5 h-5"}),color:"text-purple-600 bg-purple-100",subcategories:[{id:"daily_spin",name:"Daily Spin Available"},{id:"jackpot_won",name:"Jackpot Won"},{id:"bonus_earned",name:"Bonus Earned"}]},{id:"security",name:"Security",description:"Account activity and security updates",icon:e.jsx(G,{className:"w-5 h-5"}),color:"text-red-600 bg-red-100",subcategories:[{id:"new_login",name:"New Login Alert"},{id:"password_changed",name:"Password Changed"},{id:"suspicious_activity",name:"Suspicious Activity"}]},{id:"marketing",name:"Marketing",description:"Promotions, new features, and product updates",icon:e.jsx(I,{className:"w-5 h-5"}),color:"text-orange-600 bg-orange-100",subcategories:[{id:"promotions",name:"Promotions & Offers"},{id:"new_features",name:"New Features"},{id:"product_updates",name:"Product Updates"}]}],N=[{id:"email",name:"Email",icon:e.jsx(j,{className:"w-4 h-4"})},{id:"push",name:"Push",icon:e.jsx(k,{className:"w-4 h-4"})},{id:"in_app",name:"In-App",icon:e.jsx(S,{className:"w-4 h-4"})}];return e.jsxs("div",{className:"min-h-screen bg-gray-50",children:[e.jsx("div",{className:"bg-white shadow-sm",children:e.jsx("div",{className:"max-w-4xl mx-auto px-4 py-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:()=>m(-1),className:"p-2 hover:bg-gray-100 rounded-lg transition-colors",children:e.jsx(P,{className:"w-5 h-5"})}),e.jsx("h1",{className:"text-xl font-semibold",children:"Notification Settings"})]}),e.jsxs("button",{onClick:_,disabled:l,className:"flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50",children:[e.jsx(Y,{className:"w-4 h-4"}),l?"Saving...":"Save Changes"]})]})})}),e.jsx(B,{children:r&&e.jsx(F.div,{initial:{opacity:0,y:-20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},className:"fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg",children:"Settings saved successfully!"})}),e.jsxs("div",{className:"max-w-4xl mx-auto px-4 py-8 space-y-8",children:[e.jsxs("div",{className:"bg-white rounded-lg shadow-sm p-6",children:[e.jsx("h2",{className:"text-lg font-semibold mb-4",children:"Notification Channels"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("label",{className:"flex items-center justify-between cursor-pointer",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(j,{className:"w-5 h-5 text-gray-600"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"Email Notifications"}),e.jsx("p",{className:"text-sm text-gray-600",children:"Receive notifications via email"})]})]}),e.jsx("input",{type:"checkbox",checked:(s==null?void 0:s.email_enabled)||!1,onChange:()=>o("email_enabled"),className:"w-5 h-5 text-purple-600 rounded focus:ring-purple-500"})]}),e.jsxs("label",{className:"flex items-center justify-between cursor-pointer",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(k,{className:"w-5 h-5 text-gray-600"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"Push Notifications"}),e.jsx("p",{className:"text-sm text-gray-600",children:"Receive push notifications on your device"})]})]}),e.jsx("input",{type:"checkbox",checked:(s==null?void 0:s.push_enabled)||!1,onChange:()=>o("push_enabled"),className:"w-5 h-5 text-purple-600 rounded focus:ring-purple-500"})]}),e.jsxs("label",{className:"flex items-center justify-between cursor-pointer",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(S,{className:"w-5 h-5 text-gray-600"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"In-App Notifications"}),e.jsx("p",{className:"text-sm text-gray-600",children:"See notifications within the app"})]})]}),e.jsx("input",{type:"checkbox",checked:(s==null?void 0:s.in_app_enabled)||!1,onChange:()=>o("in_app_enabled"),className:"w-5 h-5 text-purple-600 rounded focus:ring-purple-500"})]}),e.jsxs("label",{className:"flex items-center justify-between cursor-pointer",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(M,{className:"w-5 h-5 text-gray-600"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"SMS Notifications"}),e.jsx("p",{className:"text-sm text-gray-600",children:"Critical security alerts only"})]})]}),e.jsx("input",{type:"checkbox",checked:(s==null?void 0:s.sms_enabled)||!1,onChange:()=>o("sms_enabled"),className:"w-5 h-5 text-purple-600 rounded focus:ring-purple-500"})]})]})]}),e.jsxs("div",{className:"bg-white rounded-lg shadow-sm p-6",children:[e.jsx("h2",{className:"text-lg font-semibold mb-4",children:"Notification Categories"}),e.jsx("div",{className:"space-y-6",children:C.map(i=>e.jsxs("div",{className:"border-b last:border-0 pb-6 last:pb-0",children:[e.jsxs("div",{className:"flex items-start gap-3 mb-4",children:[e.jsx("div",{className:`p-2 rounded-lg ${i.color}`,children:i.icon}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"font-medium",children:i.name}),e.jsx("p",{className:"text-sm text-gray-600",children:i.description})]}),e.jsx("div",{className:"flex gap-2",children:N.map(t=>{const d=`${i.id}_${t.id}`,h=(s==null?void 0:s[d])!==!1,p=s==null?void 0:s[`${t.id}_enabled`];return e.jsxs("label",{className:`flex items-center gap-1 text-xs px-2 py-1 rounded-md cursor-pointer transition-colors ${h&&p?"bg-purple-100 text-purple-700":"bg-gray-100 text-gray-500"} ${p?"":"opacity-50"}`,title:`Toggle all ${i.name} ${t.name} notifications`,children:[e.jsx("input",{type:"checkbox",checked:h&&p,onChange:()=>o(d),disabled:!p,className:"sr-only"}),t.icon,e.jsx("span",{children:t.name})]},t.id)})})]}),i.subcategories&&e.jsx("div",{className:"ml-11 space-y-3",children:i.subcategories.map(t=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-gray-700",children:t.name}),e.jsx("div",{className:"flex gap-3",children:N.map(d=>{const h=`${t.id}_${d.id}`,p=(s==null?void 0:s[h])!==!1,b=s==null?void 0:s[`${d.id}_enabled`],v=(s==null?void 0:s[`${i.id}_${d.id}`])!==!1;return e.jsxs("label",{className:`flex items-center gap-1 cursor-pointer ${!b||!v?"opacity-50":""}`,children:[e.jsx("input",{type:"checkbox",checked:p&&b&&v,onChange:()=>o(h),disabled:!b||!v,className:"w-4 h-4 text-purple-600 rounded focus:ring-purple-500"}),e.jsx("span",{className:"text-xs text-gray-600",children:d.name})]},d.id)})})]},t.id))})]},i.id))})]}),e.jsxs("div",{className:"bg-white rounded-lg shadow-sm p-6",children:[e.jsx("h2",{className:"text-lg font-semibold mb-4",children:"Quiet Hours"}),e.jsxs("label",{className:"flex items-center justify-between cursor-pointer mb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(W,{className:"w-5 h-5 text-gray-600"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"Enable Quiet Hours"}),e.jsx("p",{className:"text-sm text-gray-600",children:"Pause non-critical notifications during set hours"})]})]}),e.jsx("input",{type:"checkbox",checked:(s==null?void 0:s.quiet_hours_enabled)||!1,onChange:()=>o("quiet_hours_enabled"),className:"w-5 h-5 text-purple-600 rounded focus:ring-purple-500"})]}),(s==null?void 0:s.quiet_hours_enabled)&&e.jsxs("div",{className:"ml-8 space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("label",{className:"text-sm",children:["From:",e.jsx("input",{type:"time",value:s.quiet_hours_start||"22:00",onChange:i=>n(t=>({...t,quiet_hours_start:i.target.value})),className:"ml-2 px-3 py-1 border rounded-lg"})]}),e.jsxs("label",{className:"text-sm",children:["To:",e.jsx("input",{type:"time",value:s.quiet_hours_end||"08:00",onChange:i=>n(t=>({...t,quiet_hours_end:i.target.value})),className:"ml-2 px-3 py-1 border rounded-lg"})]})]}),e.jsx("p",{className:"text-xs text-gray-500",children:"Critical security notifications will still be sent during quiet hours"})]})]}),e.jsxs("div",{className:"bg-white rounded-lg shadow-sm p-6",children:[e.jsx("h2",{className:"text-lg font-semibold mb-4",children:"Email Digests"}),e.jsx("div",{className:"space-y-4",children:e.jsxs("label",{className:"flex items-center justify-between cursor-pointer",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(L,{className:"w-5 h-5 text-gray-600"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"Weekly Summary"}),e.jsx("p",{className:"text-sm text-gray-600",children:"Receive a weekly summary of your activity"})]})]}),e.jsx("input",{type:"checkbox",checked:(s==null?void 0:s.weekly_digest_enabled)||!1,onChange:()=>o("weekly_digest_enabled"),className:"w-5 h-5 text-purple-600 rounded focus:ring-purple-500"})]})})]}),e.jsx(O,{userEmail:(a==null?void 0:a.email)||"jacksonfitzgerald25@gmail.com"})]})]})};export{Z as default};
